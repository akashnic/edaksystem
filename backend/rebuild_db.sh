#!/bin/bash
python manage.py shell -c "from django.db import connection; cursor = connection.cursor(); cursor.execute('drop schema public cascade; create schema public;')"
python manage.py migrate
python manage.py loaddata register_data.json
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@example.com', 'admin')" | python manage.py shell
