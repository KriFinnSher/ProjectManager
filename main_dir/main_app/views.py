from django.shortcuts import render


def index(request):
    return render(request, 'main_app/main_page.html')


def help(request):
    return render(request, 'main_app/help.html')


def rating(request):
    return render(request, 'main_app/rating.html')
