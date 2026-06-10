# CORS (Cross-Origin Resource Sharing) configuration
# Handles requests from different origins based on environment
#
# Security: In production, restrict to whitelisted origins to prevent XSS attacks
# In development, allow all origins for easier local testing

# Determine which origins are allowed based on environment
allowed_origins = if Rails.env.production?
                     # Production: Use environment variable for whitelisted origins
                     # Set via: export CORS_ORIGINS="https://example.com,https://www.example.com"
                     ENV["CORS_ORIGINS"]&.split(",")&.map(&:strip) || [ "localhost" ]
else
                     # Development: Allow all origins for convenience
                     "*"
end

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*Array(allowed_origins))

    resource "*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ]
  end
end
