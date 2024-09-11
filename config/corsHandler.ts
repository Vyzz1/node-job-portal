import cors, { CorsOptions } from "cors";
import { allowedSite } from "./allowedSite";

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (allowedSite.indexOf(origin!) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS !!"));
    }
  },

  optionsSuccessStatus: 200,
};

const corsHandler = cors(corsOptions);

export default corsHandler;
