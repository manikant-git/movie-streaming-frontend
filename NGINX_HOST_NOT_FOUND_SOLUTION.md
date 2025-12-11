NGINX_HOST_NOT_FOUND_SOLUTION.md# Nginx "host not found" Error - Root Cause & Solution

## 🔴 The Error

```
nginx: [emerg] host not found in upstream "api-gateway" in /etc/nginx/conf.d/nginx.conf:24
Failed to load module
```

## 📌 Root Cause Analysis

**What happens:**
1. ❌ Nginx reads `nginx.conf` file
2. ❌ Tries to resolve hostname `api-gateway` immediately on startup
3. ❌ Can't find the host (because it's not running or not in the same network)
4. ❌ Nginx fails with `[emerg]` error and won't start

**Why it happens:**
- Original config: `proxy_pass http://api-gateway:8080;` (direct hostname)
- When running in **docker-compose** with services: Works (automatic DNS)
- When running **standalone** or without service: Fails (host not found)
- Nginx tries to resolve at **startup time**, not runtime

## ✅ The Solution

We use nginx `resolver` directive + variables to make hostname resolution lazy (at request time, not startup):

```nginx
# At the top of your server block:
resolver 127.0.0.11 valid=10s;  # Docker's internal DNS resolver
resolver_timeout 5s;

# In your location block:
location /api/ {
    set $api_gateway "http://api-gateway:8080";  # Use variable instead of direct hostname
    proxy_pass $api_gateway;  # Resolves at request time, not startup
    ...
}
```

**Why this works:**
- `resolver 127.0.0.11` = Docker's internal DNS server
- Using `set $api_gateway "http://api-gateway:8080"` makes it a variable
- Variables are resolved at **request time**, not startup
- Even if service isn't available, nginx still starts
- Returns error only when someone actually requests `/api/`

## 🎯 Three Solutions Compared

| Solution | Works Standalone | Works docker-compose | Production Ready | Notes |
|----------|------------------|---------------------|------------------|-------|
| **Direct hostname** `proxy_pass http://api-gateway:8080;` | ❌ No | ✅ Yes | ❌ No | Fails at startup if host doesn't exist |
| **Localhost** `proxy_pass http://localhost:8080;` | ✅ Yes | ❌ No | ❌ No | Only works on same host |
| **Resolver + variable** (Our fix) | ✅ Yes | ✅ Yes | ✅ Yes | Gracefully handles missing service |

## 🚀 How to Use This Solution

### For Development (Standalone Container)
```bash
# No other services running
docker run -p 80:80 -p 3000:80 frontend:1.0.0

# Will start successfully!
# If someone tries /api/, they'll get a 503 error (service unavailable)
```

### For Production (Docker Compose)
```bash
docker-compose up

# All services start in same network
# DNS resolution works automatically
# Everything connects properly
```

### For Kubernetes
```bash
kubectl apply -f deployment.yaml

# Services discover each other via DNS
# Works transparently
```

## 🔧 Advanced: Error Handling

Our updated `nginx.conf` also includes:

```nginx
# If api-gateway is unavailable
error_page 502 503 504 = @api_error;

# Fallback response
location @api_error {
    return 503 '{"error": "API Gateway is unavailable"}';
    add_header Content-Type 'application/json';
}
```

This means:
- ✅ Frontend still loads
- ✅ Returns proper JSON error for API requests
- ✅ User-friendly error messages

## 📚 Key Concepts

### Nginx Startup Validation
- Validates all `upstream` hostnames at startup
- Fails fast if configuration is wrong
- This is a **feature**, not a bug (catches config errors early)

### Docker DNS
- `127.0.0.11:53` = Docker's embedded DNS server
- Resolves service names in docker-compose networks
- Only available inside containers

### Runtime vs Startup Resolution
- **Startup**: `proxy_pass http://api-gateway:8080;` (bad for microservices)
- **Runtime**: `set $var "http://api-gateway:8080"; proxy_pass $var;` (good for microservices)

## ✅ Verification

To verify the fix works:

```bash
# Pull latest changes
git pull origin main

# Rebuild image
docker build -t frontend:1.0.0 .

# Run standalone (without docker-compose)
docker run -p 3000:80 frontend:1.0.0

# Should start successfully!
curl http://localhost:3000/health
# Returns: healthy ✅

curl http://localhost:3000/api/movies
# Returns: {"error": "API Gateway is unavailable"} (graceful fallback)
```

## 📖 Related Files

- `nginx.conf` - Contains the resolver configuration
- `Dockerfile` - Builds the container with nginx
- `docker-compose.yml` - For running full stack (coming soon)

## 🎓 Learning Resources

- [Nginx resolver directive](http://nginx.org/en/docs/http/ngx_http_core_module.html#resolver)
- [Nginx variables](http://nginx.org/en/docs/http/ngx_http_core_module.html#var_proxy_pass)
- [Docker networking](https://docs.docker.com/network/)
- [Docker Compose DNS](https://docs.docker.com/compose/networking/#differences-between-networks)
