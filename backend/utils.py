from math import radians, sin, cos, sqrt, atan2


def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = (sin(dlat/2)**2 +
         cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2)
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))


def get_watchers_in_radius(all_watchers, report_lat, report_lon, radius_km=10):
    return [
        w for w in all_watchers
        if haversine_km(report_lat, report_lon, w.lat, w.lon) <= radius_km
    ]
