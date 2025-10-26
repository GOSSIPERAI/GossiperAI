/** @type {import('next').NextConfig} 
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'microphone=(), camera=(), geolocation=()'
          }
        ]
      }
    ]
  }
}

export default nextConfig  */


/** @type {import('next').NextConfig} */ 
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  //lightning css optimization is causing issues with some styles, disabling for now
 /* experimental: {
    optimizeCss: false,

  },*/
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'microphone=(self), camera=(self), geolocation=(self)'  // ✅ Allow access
          }
        ]
      }
    ]
  }
}

export default nextConfig

