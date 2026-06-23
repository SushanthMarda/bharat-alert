import os
import datetime
import logging
from functools import wraps

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from flask_limiter import Limiter
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

from models import Base, User, Report, Sighting
from utils import haversine_km, get_watchers_in_radius

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET', 'dev-secret')

# SQLite setup
engine = create_engine('sqlite:///data.db', echo=False)
Base.metadata.create_all(engine)
Session = scoped_session(sessionmaker(bind=engine))

# SocketIO
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Flask-Limiter
limiter = Limiter(
    app=app,
    key_func=lambda: request.remote_addr,
    default_limits=["200 per day", "50 per hour"]
)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Config from env
ALERT_RADIUS_KM = float(os.getenv('ALERT_RADIUS_KM', '10'))
FAST2SMS_API_KEY = os.getenv('FAST2SMS_API_KEY', '')
JWT_SECRET = os.getenv('JWT_SECRET', 'change_this_secret_key')

# Socket session mapping  user_id → sid
user_socket_map = {}

# ---------------------------------------------------------------------------
# Seed admin
# ---------------------------------------------------------------------------

def seed_admin():
    session = Session()
    admin = session.query(User).filter_by(role='admin').first()
    if not admin:
        admin_username = os.getenv('ADMIN_USERNAME', 'admin')
        admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')
        admin = User(
            username=admin_username,
            password_hash=generate_password_hash(admin_password),
            role='admin'
        )
        session.add(admin)
        session.commit()
        logger.info(f"Created default admin: {admin_username}")
    session.close()

# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------

def create_jwt(user):
    payload = {
        'user_id': user.id,
        'username': user.username,
        'role': user.role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=8)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')


def decode_jwt(token):
    return jwt.decode(token, JWT_SECRET, algorithms=['HS256'])

# ---------------------------------------------------------------------------
# Decorators
# ---------------------------------------------------------------------------

def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return jsonify({"data": None, "error": "Missing or invalid token"}), 401
        try:
            payload = decode_jwt(auth[7:])
            if payload.get('role') != 'admin':
                return jsonify({"data": None, "error": "Admin access required"}), 403
            request.current_user = payload
        except jwt.ExpiredSignatureError:
            return jsonify({"data": None, "error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"data": None, "error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated

# ---------------------------------------------------------------------------
# Response helpers
# ---------------------------------------------------------------------------

def success(data, status=200):
    return jsonify({"data": data, "error": None}), status


def error(msg, status=400):
    return jsonify({"data": None, "error": msg}), status

# ---------------------------------------------------------------------------
# SMS helper
# ---------------------------------------------------------------------------

def send_sms(phone_number, message):
    if not FAST2SMS_API_KEY:
        logger.warning("FAST2SMS_API_KEY not set — skipping SMS")
        return
    url = "https://www.fast2sms.com/dev/bulkV2"
    headers = {
        "authorization": FAST2SMS_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "route": "dlt",
        "sender_id": "BHALRT",
        "message": message,
        "language": "english",
        "flash": 0,
        "numbers": phone_number
    }
    try:
        resp = requests.post(url, json=payload, headers=headers)
        logger.info(f"SMS to {phone_number}: {resp.status_code} - {resp.text}")
    except Exception as e:
        logger.error(f"SMS failed for {phone_number}: {e}")

# ===========================================================================
# API Endpoints
# ===========================================================================

# ---- Auth ----------------------------------------------------------------

@app.route('/api/auth/login', methods=['POST'])
def auth_login():
    data = request.json or {}
    username = data.get('username', '')
    password = data.get('password', '')

    session = Session()
    user = session.query(User).filter_by(username=username).first()
    session.close()

    if not user or not check_password_hash(user.password_hash, password):
        return error("Invalid credentials", 401)

    token = create_jwt(user)
    return success({
        "token": token,
        "user": user.to_dict()
    })


@app.route('/api/auth/me', methods=['GET'])
@require_admin
def auth_me():
    return success(dict(request.current_user))

# ---- Reports -------------------------------------------------------------

@app.route('/api/reports', methods=['GET'])
def get_reports():
    session = Session()
    query = session.query(Report)
    status_filter = request.args.get('status')
    if status_filter:
        query = query.filter(Report.status == status_filter)
    reports = query.all()
    session.close()
    return success([r.to_dict() for r in reports])


@app.route('/api/reports/<int:report_id>', methods=['GET'])
def get_report(report_id):
    session = Session()
    report = session.query(Report).filter_by(id=report_id).first()
    session.close()
    if not report:
        return error("Report not found", 404)
    return success(report.to_dict())


@app.route('/api/reports', methods=['POST'])
@limiter.limit("5 per minute")
def create_report():
    data = request.json or {}

    session = Session()
    report = Report(
        child_name=data.get('childName', ''),
        age=data.get('age'),
        last_seen_location=data.get('lastSeenLocation'),
        lat=data.get('lat'),
        lon=data.get('lon'),
        photo_url=data.get('photoUrl'),
        reporter_name=data.get('reporterName'),
        reporter_contact=data.get('reporterContact'),
        status='pending'
    )
    session.add(report)
    session.flush()  # get the id

    # Tier 1 alert — notify watchers in radius via WebSocket
    watchers = session.query(User).filter_by(role='watcher').all()
    nearby = get_watchers_in_radius(watchers, report.lat or 0, report.lon or 0, ALERT_RADIUS_KM)
    for w in nearby:
        sid = user_socket_map.get(w.id)
        if sid:
            socketio.emit("new_alert", report.to_dict(), to=sid)

    session.commit()
    session.close()
    return success(report.to_dict(), 201)


@app.route('/api/reports/<int:report_id>/approve', methods=['POST'])
@require_admin
def approve_report(report_id):
    session = Session()
    report = session.query(Report).filter_by(id=report_id).first()
    if not report:
        session.close()
        return error("Report not found", 404)

    # Tier 2 alert — send SMS to watchers in radius
    watchers = session.query(User).filter_by(role='watcher').all()
    nearby = get_watchers_in_radius(watchers, report.lat or 0, report.lon or 0, ALERT_RADIUS_KM)
    for w in nearby:
        if w.phone_number:
            msg = f"BHARAT ALERT: Missing child alert activated for {report.child_name}. Last seen: {report.last_seen_location}. Please report any sightings immediately."
            send_sms(w.phone_number, msg)

    report.status = 'approved'
    session.commit()
    session.close()

    # Emit globally
    socketio.emit("report_approved", report.to_dict())

    return success(report.to_dict())


@app.route('/api/reports/<int:report_id>/reject', methods=['POST'])
@require_admin
def reject_report(report_id):
    session = Session()
    report = session.query(Report).filter_by(id=report_id).first()
    if not report:
        session.close()
        return error("Report not found", 404)
    report.status = 'rejected'
    session.commit()
    session.close()
    return success(report.to_dict())


@app.route('/api/reports/<int:report_id>/solve', methods=['POST'])
@require_admin
def solve_report(report_id):
    session = Session()
    report = session.query(Report).filter_by(id=report_id).first()
    if not report:
        session.close()
        return error("Report not found", 404)
    report.status = 'solved'
    report.resolved_at = datetime.datetime.utcnow()
    session.commit()
    session.close()
    return success(report.to_dict())

# ---- Sightings ----------------------------------------------------------

@app.route('/api/sightings', methods=['GET'])
def get_sightings():
    session = Session()
    query = session.query(Sighting)
    report_id = request.args.get('report_id')
    if report_id:
        query = query.filter(Sighting.report_id == report_id)
    sightings = query.all()
    session.close()
    return success([s.to_dict() for s in sightings])


@app.route('/api/sightings', methods=['POST'])
@limiter.limit("10 per minute")
def create_sighting():
    data = request.json or {}
    session = Session()
    sighting = Sighting(
        report_id=data.get('reportId'),
        description=data.get('description'),
        lat=data.get('lat'),
        lon=data.get('lon'),
        submitted_by=data.get('submittedBy')
    )
    session.add(sighting)
    session.commit()
    session.close()

    socketio.emit("new_sighting", sighting.to_dict())
    return success(sighting.to_dict(), 201)

# ---- Watcher registration -----------------------------------------------

@app.route('/api/watchers/register', methods=['POST'])
@limiter.limit("3 per minute")
def register_watcher():
    data = request.json or {}
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return error("Username and password are required")

    session = Session()
    existing = session.query(User).filter_by(username=username).first()
    if existing:
        session.close()
        return error("Username already taken")

    watcher = User(
        username=username,
        password_hash=generate_password_hash(password),
        role='watcher',
        phone_number=data.get('phoneNumber'),
        lat=data.get('lat'),
        lon=data.get('lon')
    )
    session.add(watcher)
    session.commit()
    session.close()

    token = create_jwt(watcher)
    return success({
        "token": token,
        "user": watcher.to_dict()
    }, 201)

# ---- Stats --------------------------------------------------------------

@app.route('/api/stats', methods=['GET'])
def get_stats():
    session = Session()
    pending = session.query(Report).filter(Report.status == 'pending').count()
    approved = session.query(Report).filter(Report.status == 'approved').count()
    solved = session.query(Report).filter(Report.status == 'solved').count()
    total_sightings = session.query(Sighting).count()
    total_watchers = session.query(User).filter(User.role == 'watcher').count()
    session.close()
    return success({
        "pending": pending,
        "approved": approved,
        "solved": solved,
        "totalSightings": total_sightings,
        "totalWatchers": total_watchers
    })

# ---- Map data -----------------------------------------------------------

@app.route('/api/map-data', methods=['GET'])
def get_map_data():
    session = Session()
    reports = session.query(Report).filter(
        Report.status == 'approved',
        Report.lat.isnot(None),
        Report.lon.isnot(None)
    ).all()

    points = []
    for r in reports:
        points.append({
            'id': r.id,
            'childName': r.child_name,
            'age': r.age,
            'lastSeenLocation': r.last_seen_location,
            'lat': r.lat,
            'lon': r.lon,
            'photoUrl': r.photo_url,
            'type': 'report',
            'submittedAt': r.submitted_at.isoformat() if r.submitted_at else None
        })

    sightings = session.query(Sighting).filter(
        Sighting.lat.isnot(None),
        Sighting.lon.isnot(None)
    ).all()
    for s in sightings:
        points.append({
            'id': s.id,
            'reportId': s.report_id,
            'description': s.description,
            'lat': s.lat,
            'lon': s.lon,
            'type': 'sighting',
            'submittedAt': s.submitted_at.isoformat() if s.submitted_at else None
        })

    session.close()
    return success(points)

# ---- Health check -------------------------------------------------------

@app.route('/api/health', methods=['GET'])
def health():
    return success({"status": "ok", "db": "sqlite"})

# ===========================================================================
# SocketIO events
# ===========================================================================


@socketio.on('connect')
def handle_connect():
    user_id = request.args.get('user_id')
    if user_id:
        user_socket_map[int(user_id)] = request.sid
    logger.info(f"Client connected: {request.sid}, user_id={user_id}")


@socketio.on('disconnect')
def handle_disconnect():
    for uid, sid in list(user_socket_map.items()):
        if sid == request.sid:
            del user_socket_map[uid]
            break
    logger.info(f"Client disconnected: {request.sid}")


# ===========================================================================
# Entry point
# ===========================================================================

if __name__ == '__main__':
    seed_admin()
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    socketio.run(app, host='0.0.0.0', port=port, debug=debug, allow_unsafe_werkzeug=True)
