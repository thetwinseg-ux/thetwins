import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'src/js', dest: '' },
        { src: '*.jpeg', dest: '' },
        { src: '*.png', dest: '' },
        { src: '*.ico', dest: '' },
        { src: 'sitemap.xml', dest: '' },
        { src: 'robots.txt', dest: '' },
        { src: 'google*.html', dest: '' }
      ]
    })
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        products: resolve(__dirname, 'products.html'),
        productDetail: resolve(__dirname, 'product-detail.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        admin: resolve(__dirname, 'admin.html'),
        setup: resolve(__dirname, 'setup.html'),
        notfound: resolve(__dirname, '404.html'),
      }
    }
  }
});
