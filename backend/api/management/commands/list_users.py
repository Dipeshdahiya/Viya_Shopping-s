from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Lists all users in the database'

    def handle(self, *args, **options):
        users = User.objects.all()
        
        if not users.exists():
            self.stdout.write(self.style.WARNING('No users found in database.'))
            return
        
        self.stdout.write(self.style.SUCCESS(f'\nFound {users.count()} user(s):\n'))
        
        for user in users:
            self.stdout.write(f'ID: {user.id}')
            self.stdout.write(f'Username: {user.username}')
            self.stdout.write(f'Email: {user.email}')
            self.stdout.write(f'First Name: {user.first_name}')
            self.stdout.write(f'Last Name: {user.last_name}')
            self.stdout.write(f'Is Active: {user.is_active}')
            self.stdout.write(f'Date Joined: {user.date_joined}')
            self.stdout.write('-' * 50)

