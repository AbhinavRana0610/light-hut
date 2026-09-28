import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: 'M/S LIGHT-HUT DECORATIVE SOLUTIONS',
    },
    tagline: {
      type: String,
      default: 'Architectural & Luxury Decorative Luminaires',
    },
    logo: {
      type: String,
      default: '',
    },
    favicon: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: 'lighthutdecorativedlh@gmail.com',
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '4B/27, Upper floor, Opp Govt School Gate no-02, Devki Nandan road, Lighting market, Tilak Nagar, New Delhi - 110018',
    },
    showroomAddress: {
      type: String,
      default: '4B/27, Upper floor, Opp Govt School Gate no-02, Devki Nandan road, Lighting market, Tilak Nagar, New Delhi - 110018',
    },
    worksAddress: {
      type: String,
      default: 'C37/4, LAWRENCE ROAD, INDUSTRIAL AREA, NEW DELHI -110035 (Near Metro Station Kanhaiya Nagar)',
    },
    mapUrl: {
      type: String,
      default: 'https://www.google.com/maps/place//@28.6394399,77.0974272,17.01z/data=!4m6!1m5!3m4!2zMjjCsDM4JzIyLjAiTiA3N8KwMDYnMDAuMCJF!8m2!3d28.6394482!4d77.1000061?hl=en',
    },
    mapEmbedUrl: {
      type: String,
      default: 'https://maps.google.com/maps?q=28.6394482,77.1000061&hl=en&z=17&output=embed',
    },
    worksMapUrl: {
      type: String,
      default: 'https://maps.google.com/maps?q=28.678613662719727%2C77.15131378173828&z=17&hl=en',
    },
    worksMapEmbedUrl: {
      type: String,
      default: 'https://maps.google.com/maps?q=28.678613662719727,77.15131378173828&hl=en&z=17&output=embed',
    },
    whatsapp: {
      type: String,
      default: '',
    },
    socialLinks: {
      instagram: { type: String, default: 'https://www.instagram.com/lighthutdecorativesolutions/' },
      facebook: { type: String, default: 'https://www.facebook.com/profile.php?id=61584975975926' },
      pinterest: { type: String, default: 'https://pinterest.com' },
      youtube: { type: String, default: 'https://youtube.com/@light-hutdecorativesolutions?si=KKvN5-pzw1JikI-C' },
    },
    footerContent: {
      copyrightText: {
        type: String,
        default: '© 2026 LightHut Decorative Solutions. All Rights Reserved.',
      },
      aboutText: {
        type: String,
        default: 'Pioneering contemporary architectural lighting solutions, precision engineered luminaires, and tailored illumination for luxury residential and commercial environments.',
      },
      gstNumber: {
        type: String,
        default: '07BSYPK8425N1ZP',
      }
    },
    defaultSeoTitle: {
      type: String,
      default: 'LightHut | Premium Architectural & Decorative Lighting Manufacturer',
    },
    defaultSeoDescription: {
      type: String,
      default: 'Discover high-performance architectural wall lamps, pendant luminaires, modern table lamps, and custom lighting fixtures engineered for premier spaces.',
    },
  },
  {
    timestamps: true,
  }
);

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
export default SiteSettings;
