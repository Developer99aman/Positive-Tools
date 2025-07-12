# Tool Hub - Vercel Deployment Guide

This guide will help you deploy your Tool Hub to Vercel for free hosting.

## Prerequisites

1. **GitHub Account**: You'll need a GitHub account to connect with Vercel
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier available)
3. **Git**: Make sure Git is installed on your computer

## Step 1: Prepare Your Project

1. **Extract the project files** from the zip file to your local computer
2. **Navigate to the project directory** in your terminal/command prompt:
   ```bash
   cd tool-hub-nextjs
   ```

## Step 2: Initialize Git Repository

1. **Initialize Git** in your project directory:
   ```bash
   git init
   ```

2. **Add all files** to Git:
   ```bash
   git add .
   ```

3. **Commit the files**:
   ```bash
   git commit -m "Initial commit - Tool Hub project"
   ```

## Step 3: Push to GitHub

1. **Create a new repository** on GitHub:
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name it "tool-hub" or any name you prefer
   - Make it public or private (your choice)
   - Don't initialize with README (since you already have files)

2. **Connect your local repository** to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Sign up/Login** to [vercel.com](https://vercel.com)
2. **Connect GitHub** account if not already connected
3. **Import Project**:
   - Click "New Project"
   - Select "Import Git Repository"
   - Choose your GitHub repository
4. **Configure Project**:
   - Framework Preset: Next.js (should auto-detect)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `out` (should auto-detect)
5. **Deploy**: Click "Deploy" button

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

## Step 5: Configure Custom Domain (Optional)

1. **In Vercel Dashboard**:
   - Go to your project
   - Click "Settings" tab
   - Click "Domains" in sidebar
   - Add your custom domain

2. **Update DNS** (if using custom domain):
   - Add CNAME record pointing to your Vercel URL
   - Or use Vercel nameservers

## Environment Variables (If Needed)

If your project requires environment variables:

1. **In Vercel Dashboard**:
   - Go to project settings
   - Click "Environment Variables"
   - Add required variables

## Automatic Deployments

Once connected to GitHub:
- **Every push** to main branch triggers automatic deployment
- **Pull requests** create preview deployments
- **Rollback** to previous versions easily

## Troubleshooting

### Build Errors
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Next.js configuration

### 404 Errors
- Ensure `output: 'export'` is in `next.config.ts`
- Check file paths and routing

### Performance Issues
- Enable Vercel Analytics
- Use Next.js Image optimization
- Check bundle size

## Project Structure

```
tool-hub-nextjs/
├── src/
│   └── app/
│       ├── page.tsx                 # Homepage
│       ├── passport-photo/          # Passport Photo Maker
│       ├── hd-background-remover/   # HD Background Remover
│       ├── image-compressor/        # Image Compressor
│       └── qr-generator/           # QR Code Generator
├── public/                         # Static assets
├── package.json                    # Dependencies
├── next.config.ts                  # Next.js configuration
└── tailwind.config.ts             # Tailwind CSS configuration
```

## Features Included

✅ **4 Professional Tools**:
- Passport Photo Maker with manual cropping
- HD Background Remover with AI
- Image Compressor with batch processing
- QR Code Generator with multiple types

✅ **Technical Features**:
- Next.js 15 with TypeScript
- Tailwind CSS for styling
- Client-side processing (privacy-first)
- Responsive design
- SEO optimized

✅ **Production Ready**:
- Optimized build
- Static export for fast loading
- Error handling
- Professional UI/UX

## Support

For deployment issues:
1. Check Vercel documentation
2. Review build logs
3. Ensure all dependencies are installed
4. Verify Next.js configuration

Your Tool Hub is now ready for production deployment! 🚀

