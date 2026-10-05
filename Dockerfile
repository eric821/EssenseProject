FROM php:8.4-apache

# ==========================================
# System dependencies
# ==========================================
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    && rm -rf /var/lib/apt/lists/*


# ==========================================
# PHP extensions
# ==========================================
RUN docker-php-ext-install \
    mysqli \
    pdo \
    pdo_mysql


# ==========================================
# Node.js + npm
# ==========================================
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && node --version \
    && npm --version \
    && rm -rf /var/lib/apt/lists/*


# ==========================================
# Apache
# ==========================================
RUN a2enmod rewrite

WORKDIR /var/www/html

RUN sed -i 's/AllowOverride None/AllowOverride All/g' \
    /etc/apache2/apache2.conf

EXPOSE 80
EXPOSE 5173

CMD ["apache2-foreground"]