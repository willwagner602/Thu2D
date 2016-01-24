__author__ = 'wwagner'

from django.conf.urls import include, url
from django.views.generic import TemplateView

urlpatterns = [
        url(r"^$", TemplateView.as_view(template_name='Thu2d/Thu2D.html', )),
        url(r"^/", include('Thud.urls', namespace='Thud')),
    ]
