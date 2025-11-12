// import { createOrUpdate, deleteUser } from '@/app/libs/actions/user'
// import { clerkClient } from '@clerk/nextjs/dist/types/server'
// import { verifyWebhook } from '@clerk/nextjs/webhooks'
// import { NextRequest } from 'next/server'

// export async function POST(req ) {
//   try {
//     const evt = await verifyWebhook(req)

//     // Do something with payload
//     // For this guide, log payload to console
//     const { id } = evt?.data
//     const eventType = evt?.type
//     console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
//     console.log('Webhook payload:', evt.data)

//     if (eventType === 'user.created' ||  eventType ==='user.updated') {
//         const { first_name,  last_name, image_url, email_addresses} = evt?.data
//    try {
//     const user = await createOrUpdate(
//         id,
//         first_name,
//         last_name,
//         image_url,
//         email_addresses

//     );
//     if(user && eventType === 'user.created'){
//        try {
//         await clerkClient.user.updateUserMetadata(id, {
//             publicMetadata: {
//                 userMogoId: user._id,

//             }
//         })
//        } catch (error) {
//         console.log("some error can't update matadata", error)
//        }  
//     }
//    } catch (error) {
//      console.log("some error", error)
//    }
// }

// if(eventType === 'user.deleted'){
//     try {
//         await deleteUser(id);

//     } catch (error) {
//          console.log("some error", error)
//          return new Response("Error: can't delete data", error)
//          return 400
//     }
// }

//     return new Response('Webhook received', { status: 200 })
//   } catch (err) {
//     console.error('Error verifying webhook:', err)
//     return new Response('Error verifying webhook', { status: 400 })
//   }
// }


import { Webhook } from "svix";
import { headers } from "next/headers";
import { clerkClient } from "@clerk/nextjs/server";
import { createOrUpdate, deleteUser } from "@/app/libs/actions/user";

export async function POST(req) {
  const payload = await req.text();
  const headersList = headers();

  const svix_id = headersList.get("svix-id");
  const svix_timestamp = headersList.get("svix-timestamp");
  const svix_signature = headersList.get("svix-signature");

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

  let evt;
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;
  console.log(`Received webhook with ID ${id} and event type ${eventType}`);

  try {
    if (eventType === "user.created" || eventType === "user.updated") {
      const { first_name, last_name, image_url, email_addresses } = evt.data;

      const user = await createOrUpdate(
        id,
        first_name,
        last_name,
        image_url,
        email_addresses
      );

      if (user && eventType === "user.created") {
        try {
          await clerkClient.users.updateUserMetadata(id, {
            publicMetadata: {
              userMongoId: user._id,
            },
          });
        } catch (error) {
          console.log("Error updating metadata:", error);
        }
      }
    }

    if (eventType === "user.deleted") {
      await deleteUser(id);
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("Error handling webhook event:", error);
    return new Response("Server error", { status: 500 });
  }
}
