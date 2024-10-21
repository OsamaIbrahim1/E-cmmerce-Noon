const allowedOrigins = [
  "http://localhost:3000",
  "https://frontend-ecommerce-noon-99mgics38-osamaibrahim1s-projects.vercel.app",
  "https://frontend-ecommerce-noon.vercel.app"
];

export const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
};
