import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { User } from "../models/User";

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.BACKEND_URL}/api/v1/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google Profile:", profile);

        // Kiểm tra user đã tồn tại chưa
        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email: profile.emails?.[0]?.value },
          ],
        });

        if (user) {
          // User đã tồn tại, cập nhật thông tin nếu cần
          if (!user.googleId) {
            user.googleId = profile.id;
          }
          if (!user.isEmailVerified && profile.emails?.[0]?.verified) {
            user.isEmailVerified = true;
          }
          await user.save();
        } else {
          // Tạo user mới
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            avatar: profile.photos?.[0]?.value,
            isEmailVerified: profile.emails?.[0]?.verified || true,
            // Không có password vì dùng OAuth
          });
          await user.save();
        }

        const userObject = {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
        };

        return done(null, userObject);
      } catch (error) {
        console.error("Google OAuth Error:", error);
        return done(error, false);
      }
    }
  )
);

// Facebook OAuth Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      callbackURL: `${process.env.BACKEND_URL}/api/v1/auth/facebook/callback`,
      profileFields: ["id", "displayName", "email", "photos"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Facebook Profile:", profile);

        // Kiểm tra user đã tồn tại chưa
        let user = await User.findOne({
          $or: [
            { facebookId: profile.id },
            { email: profile.emails?.[0]?.value },
          ],
        });

        if (user) {
          // User đã tồn tại, cập nhật thông tin nếu cần
          if (!user.facebookId) {
            user.facebookId = profile.id;
          }
          if (!user.isEmailVerified && profile.emails?.[0]) {
            user.isEmailVerified = true;
          }
          await user.save();
        } else {
          // Tạo user mới
          user = new User({
            facebookId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            avatar: profile.photos?.[0]?.value,
            isEmailVerified: true, // Facebook usually provides verified emails
            // Không có password vì dùng OAuth
          });
          await user.save();
        }

        const userObject = {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
        };

        return done(null, userObject);
      } catch (error) {
        console.error("Facebook OAuth Error:", error);
        return done(error, false);
      }
    }
  )
);

export default passport;
