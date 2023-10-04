/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async headers() {
    return [
      // This sets CSP, however connect-test requires too many specifications on styles and inline scripts
      //       {
      //         source: "/:path*",
      //         headers: [
      //           {
      //             key: "Content-Security-Policy",
      //             value:
      //               `script-src 'self' https://connect-js.stripe.com https://js.stripe.com https://www.googletagmanager.com 'sha256-6DsbKdUn6UH/cfqJGmC9QfdnpNZJ/SmNB/NAAmezOSk=' 'sha256-BUuThnzaJiH7SHjYdPa0/PRPbJIuBKPsJqYfWT2JIqM=';
      //  img-src 'self' blob: data: https://*.stripe.com;
      //  font-src 'self' https://static2.sharepointonline.com;
      //  frame-ancestors 'none';
      //  frame-src 'self' https://connect-js.stripe.com https://js.stripe.com;
      //  style-src 'self' 'sha256-0hAheEzaMe6uXIKV4EehS9pu1am1lj/KnnzrOYqckXk=' 'sha256-4/2nIlfwIVTJ1+JcNQ6LkeVWzNS148LKAJeL5yofdN4=' 'sha256-4/7Vkoi0KR24jInqpwabwRUBDNXBHgcJ5Vlg0zwaHbw=' 'sha256-+L59Yhl3v42Frqe7KPeBXIoiJFIoSqs1s0xvsAwKqjs=';`.replace(
      //                 /\n/g,
      //                 "",
      //               ),
      //           },
      //         ],
      //       },
    ];
  },
};
