# Cloud Deployment Guide

## Deploy to Vercel (Recommended - 5 minutes)

### Prerequisites
- GitHub account
- Vercel account (free)

### Steps

#### 1. Initialize Git (if not already done)
```bash
cd /Users/apple/my_website
git init
git add .
git commit -m "Initial commit: Inkline blog setup"
```

#### 2. Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/my_website.git
git branch -M main
git push -u origin main
```

#### 3. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repository
4. Click "Deploy"
5. Your site is live! (URL: `my-website.vercel.app`)

#### 4. Connect Custom Domain
1. In Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `aasishdairel.tech`)
3. Follow DNS configuration instructions
4. Update nameservers with your domain registrar

---

## Deploy to Netlify (Alternative)

1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect GitHub
4. Select your repository
5. Leave build settings empty (static site)
6. Click "Deploy site"

---

## Deploy to GitHub Pages (Simplest)

1. Push code to GitHub
2. Go to Repository Settings → Pages
3. Select "Deploy from branch" → Deploy from `main`
4. Site available at `https://YOUR_USERNAME.github.io/my_website/`

---

## Deploy to AWS S3 + CloudFront

### Setup
```bash
# Install AWS CLI
brew install awscli

# Configure credentials
aws configure

# Create S3 bucket
aws s3 mb s3://my-website-bucket --region us-east-1

# Upload files
aws s3 sync . s3://my-website-bucket --exclude ".git/*"

# Configure for static website hosting
aws s3 website s3://my-website-bucket/ \
  --index-document index.html
```

### CloudFront Distribution
1. Go to AWS CloudFront console
2. Create distribution pointing to S3 bucket
3. Set default root to `index.html`
4. Configure custom domain via Route 53

---

## Post-Deployment Checklist

- [ ] Domain is pointing to your site
- [ ] HTTPS is enabled (auto with Vercel/Netlify)
- [ ] Blog posts load correctly
- [ ] Links work (projects, blog pages)
- [ ] GitHub profile link works
- [ ] Mobile responsive (test on phone)
- [ ] Set up auto-deployments on git push

---

## Automatic Deployments

Once deployed, these platforms auto-deploy on every git push:

```bash
# Make changes locally
echo "new content" >> posts/my-post.md
git add .
git commit -m "Update blog post"
git push  # Site updates automatically!
```

---

## Performance Optimization (Optional)

Add to your site later:
- Image optimization with modern formats (WebP)
- CSS minification
- JavaScript bundling
- Lazy loading for images

---

## Monitoring & Analytics

- **Vercel:** Built-in Analytics
- **Netlify:** Plugins for analytics
- **GitHub Pages:** Google Analytics
- **AWS:** CloudWatch monitoring

