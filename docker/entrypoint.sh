#!/bin/sh
set -e

# Fix storage permissions for PHP-FPM workers (www-data)
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache 2>/dev/null || true

exec "$@"