import datetime
from django.utils import timezone
from .models import VisitorLog

class VisitorTelemetryMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Avoid logging static files, media files, and favicon
        path = request.path
        if not (path.startswith('/static/') or path.startswith('/media/') or path.endswith('.ico')):
            # Get IP
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0].strip()
            else:
                ip = request.META.get('REMOTE_ADDR', '127.0.0.1')
                
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            session_key = request.session.session_key or ''
            
            # Save telemetry log
            try:
                VisitorLog.objects.create(
                    ip_address=ip,
                    path=path,
                    user_agent=user_agent,
                    session_key=session_key,
                    is_live=True
                )
                
                # Cleanup older "live" visitors (older than 5 minutes)
                five_minutes_ago = timezone.now() - datetime.timedelta(minutes=5)
                VisitorLog.objects.filter(timestamp__lt=five_minutes_ago, is_live=True).update(is_live=False)
            except Exception as e:
                # Do not crash the site if log logging fails
                pass

        # Identify if this is the native android WebView wrapper using User-Agent signature
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        request.is_android_app = "Speedlink3AndroidApp" in user_agent

        response = self.get_response(request)
        return response
