from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    role = Column(String(20), nullable=False)  # 'admin' or 'watcher'
    phone_number = Column(String(20), nullable=True)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'phoneNumber': self.phone_number,
            'lat': self.lat,
            'lon': self.lon,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }


class Report(Base):
    __tablename__ = 'reports'

    id = Column(Integer, primary_key=True)
    child_name = Column(String(255), nullable=False)
    age = Column(Integer, nullable=True)
    last_seen_location = Column(String(500), nullable=True)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    photo_url = Column(String(500), nullable=True)
    reporter_name = Column(String(255), nullable=True)
    reporter_contact = Column(String(100), nullable=True)
    status = Column(String(20), default='pending')  # pending, approved, solved
    submitted_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    sightings = relationship("Sighting", back_populates="report")

    def to_dict(self):
        return {
            'id': self.id,
            'childName': self.child_name,
            'age': self.age,
            'lastSeenLocation': self.last_seen_location,
            'lat': self.lat,
            'lon': self.lon,
            'photoUrl': self.photo_url,
            'reporterName': self.reporter_name,
            'reporterContact': self.reporter_contact,
            'status': self.status,
            'submittedAt': self.submitted_at.isoformat() if self.submitted_at else None,
            'resolvedAt': self.resolved_at.isoformat() if self.resolved_at else None,
            'sightings': [s.to_dict() for s in self.sightings] if self.sightings else []
        }


class Sighting(Base):
    __tablename__ = 'sightings'

    id = Column(Integer, primary_key=True)
    report_id = Column(Integer, ForeignKey('reports.id'), nullable=False)
    description = Column(String(500), nullable=True)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    submitted_by = Column(String(255), nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    report = relationship("Report", back_populates="sightings")

    def to_dict(self):
        return {
            'id': self.id,
            'reportId': self.report_id,
            'description': self.description,
            'lat': self.lat,
            'lon': self.lon,
            'submittedBy': self.submitted_by,
            'submittedAt': self.submitted_at.isoformat() if self.submitted_at else None
        }
