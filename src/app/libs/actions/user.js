 

import User from "../models/user.model";
import connect from "../mongodb/mongoose";

export const createOrUpdate = async (
  id,
  first_name,
  last_name,
  image_url,
  email_addresses
) => {
  try {
    await connect();

    const user = await User.findOneAndUpdate(
      { clerkId: id },
      {
        $set: {
          first_name,
          last_name,
          profilePicture: image_url,
          email: email_addresses?.[0]?.email || null,
        },
      },
      { upsert: true, new: true }
    );

    return user;
  } catch (error) {
    console.error("❌ Error creating or updating user:", error);
    return null;
  }
};

export const deleteUser = async (id) => {
  try {
    await connect();

    const result = await User.findOneAndDelete({ clerkId: id });

    if (!result) {
      console.warn(`⚠️ No user found with clerkId: ${id}`);
    } else {
      console.log(`✅ User deleted with clerkId: ${id}`);
    }

    return result;
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    return null;
  }
};
