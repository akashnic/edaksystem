#!/bin/bash

# Run a python snippet to handle the reset based on the engine defined in settings
python manage.py shell -c "
import os
from django.conf import settings
from django.db import connection

db_engine = settings.DATABASES['default']['ENGINE']
if 'sqlite3' in db_engine:
    db_name = settings.DATABASES['default']['NAME']
    if os.path.exists(db_name):
        print(f'Removing SQLite database: {db_name}')
        os.remove(db_name)
elif 'postgresql' in db_engine:
    print('Resetting PostgreSQL schema...')
    with connection.cursor() as cursor:
        cursor.execute('drop schema public cascade; create schema public;')
"

python manage.py migrate
python manage.py loaddata register_data.json
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@example.com', 'admin')" | python manage.py shell
