// import httpStatus from "http-status";
// import config from "../config";
// // import { AppError } from "../utils/AppError";
// import { redisClient } from "./redis";

// export const getBkashIdToken = async () => {
// 	try {
// 		const IdTokenKey = "bkash:idToken";
// 		const RefreshTokenKey = "bkash:refreshToken";

// 		let bkashIdToken = await redisClient.get(IdTokenKey);
// 		const bkashIdTokenTTL = await redisClient.ttl(IdTokenKey);

// 		const bkashRefreshToken = await redisClient.get(RefreshTokenKey);
// 		const bkashRefreshTokenTTL = await redisClient.ttl(RefreshTokenKey);

// 		// console.log({
// 		//     bkashIdToken,
// 		//     bkashIdTokenTTL,
// 		//     bkashRefreshToken,
// 		//     bkashRefreshTokenTTL
// 		// });

// 		//bkash id token remaining time is less than equal 10 minutes or bkash id is expired
// 		// bkash refresh token must exist
// 		// bkash refresh token remaining time is more than 10 minutes
// 		if (
// 			(bkashIdTokenTTL <= 600 || !bkashIdToken) &&
// 			bkashRefreshToken &&
// 			bkashRefreshTokenTTL > 600
// 		) {
// 			const refreshTokenResponse = await fetch(
// 				`${config.bkash_base_url}/tokenized/checkout/token/refresh`,
// 				{
// 					method: "POST",
// 					headers: {
// 						"Content-Type": "application/json",
// 						Accept: "application/json",
// 						username: config.bkash_username,
// 						password: config.bkash_password,
// 					},
// 					body: JSON.stringify({
// 						app_key: config.bkash_app_key,
// 						app_secret: config.bkash_app_secret,
// 						refresh_token: bkashRefreshToken,
// 					}),
// 				},
// 			);
// 			if (!refreshTokenResponse.ok) {
// 				// throw new AppError(httpStatus.BAD_GATEWAY, "Bkash Access Token Grant Failed");
// 				throw new Error("Bkash Access Token Grant Failed");
// 			}

// 			const bkashRefreshTokenResult = await refreshTokenResponse.json();

// 			bkashIdToken = bkashRefreshTokenResult.id_token as string;

// 			await redisClient.set(IdTokenKey, bkashIdToken, {
// 				expiration: {
// 					type: "EX",
// 					value: 60 * 60,
// 				},
// 			});

// 			return bkashIdToken;
// 		}

// 		if (bkashIdTokenTTL > 600) {
// 			return bkashIdToken;
// 		}

// 		const response = await fetch(
// 			`${config.bkash_base_url}/tokenized/checkout/token/grant`,
// 			{
// 				method: "POST",
// 				headers: {
// 					"Content-Type": "application/json",
// 					Accept: "application/json",
// 					username: config.bkash_username,
// 					password: config.bkash_password,
// 				},
// 				body: JSON.stringify({
// 					app_key: config.bkash_app_key,
// 					app_secret: config.bkash_app_secret,
// 				}),
// 			},
// 		);

// 		if (!response.ok) {
// 			// throw new Error(httpStatus.BAD_GATEWAY, "Bkash Access Token Grant Failed");
//             throw new Error("Bkash Access Token Grant Failed");
// 		}

// 		const result = await response.json();

// 		//bkash id token set
// 		await redisClient.set(IdTokenKey, result.id_token, {
// 			expiration: {
// 				type: "EX",
// 				value: 60 * 60, // 1hour
// 			},
// 		});

// 		//bkash refresh token set
// 		await redisClient.set(RefreshTokenKey, result.refresh_token, {
// 			expiration: {
// 				type: "EX",
// 				value: 60 * 60 * 24 * 28, // 28 days
// 			},
// 		});

// 		bkashIdToken = result.id_token;

// 		return bkashIdToken;
// 	} catch (error: any) {
// 		// if (error instanceof AppError) {
// 		// 	throw error;
// 		// }
// 		// throw new AppError(httpStatus.BAD_GATEWAY, error.message);
// 		throw new Error(error.message);
// 	}
// };

// export const executeBkashPayment = async (paymentID: string) => {
//   try {
//     const bkashIdToken = await getBkashIdToken();

//     const response = await fetch(
//       `${config.bkash_base_url}/tokenized/checkout/execute`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//           Authorization: bkashIdToken,
//           "X-App-Key": config.bkash_app_key,
//         },
//         body: JSON.stringify({
//           paymentID,
//         }),
//       },
//     );

//     const result = await response.json();

//     if (!response.ok) {
//     //   throw new AppError(
//     //     httpStatus.BAD_GATEWAY,
//     //     result?.statusMessage || "Bkash payment execution failed",
//     //   );
//       throw new Error("Bkash payment execution failed");
//     }

//     return result;
//   } catch (error: any) {
//     // if (error instanceof AppError) {
//     //   throw error;
//     // }
//     if (error instanceof Error) {
//       throw error;
//     }

//     // throw new AppError(
//     //   httpStatus.BAD_GATEWAY,
//     //   error?.message || "Bkash payment execution failed",
//     // );
//     throw new Error("Bkash payment execution failed");
//   }
// };









import httpStatus from "http-status";
import config from "../config";
// import { AppError } from "../utils/AppError";
import { redisClient } from "./redis";

export const getBkashIdToken = async () => {
  try {
    const IdTokenKey = "bkash:idToken";
    const RefreshTokenKey = "bkash:refreshToken";

    let bkashIdToken = await redisClient.get(IdTokenKey);
    const bkashIdTokenTTL = await redisClient.ttl(IdTokenKey);

    const bkashRefreshToken =
      await redisClient.get(RefreshTokenKey);

    const bkashRefreshTokenTTL =
      await redisClient.ttl(RefreshTokenKey);

    if (
      (bkashIdTokenTTL <= 600 || !bkashIdToken) &&
      bkashRefreshToken &&
      bkashRefreshTokenTTL > 600
    ) {
      const refreshTokenResponse = await fetch(
        `${config.bkash_base_url}/tokenized/checkout/token/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            username: config.bkash_username,
            password: config.bkash_password,
          },
          body: JSON.stringify({
            app_key: config.bkash_app_key,
            app_secret: config.bkash_app_secret,
            refresh_token: bkashRefreshToken,
          }),
        },
      );

      if (!refreshTokenResponse.ok) {
        throw new Error("Bkash Access Token Refresh Failed");
        // throw new AppError(
        //   httpStatus.BAD_GATEWAY,
        //   "Bkash Access Token Refresh Failed",
        // );
      }

      const result = await refreshTokenResponse.json();

      bkashIdToken = result.id_token;

      await redisClient.set(IdTokenKey, bkashIdToken as string, {
        expiration: {
          type: "EX",
          value: 60 * 60,
        },
      });

      return bkashIdToken;
    }

    if (bkashIdTokenTTL > 600 && bkashIdToken) {
      return bkashIdToken;
    }

    const response = await fetch(
      `${config.bkash_base_url}/tokenized/checkout/token/grant`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          username: config.bkash_username,
          password: config.bkash_password,
        },
        body: JSON.stringify({
          app_key: config.bkash_app_key,
          app_secret: config.bkash_app_secret,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Bkash Access Token Grant Failed");
    //   throw new AppError(
    //     httpStatus.BAD_GATEWAY,
    //     "Bkash Access Token Grant Failed",
    //   );
    }

    const result = await response.json();

    await redisClient.set(IdTokenKey, result.id_token, {
      expiration: {
        type: "EX",
        value: 60 * 60,
      },
    });

    await redisClient.set(
      RefreshTokenKey,
      result.refresh_token,
      {
        expiration: {
          type: "EX",
          value: 60 * 60 * 24 * 28,
        },
      },
    );

    return result.id_token;
  } catch (error: any) {
    if (error instanceof Error) {
      throw error;
    }
    // if (error instanceof AppError) {
    //   throw error;
    // }

    throw new Error("Bkash token generation failed");
    // throw new AppError(
    //   httpStatus.BAD_GATEWAY,
    //   error?.message || "Bkash token generation failed",
    // );
  }
};

export const executeBkashPayment = async (
  paymentID: string,
) => {
  try {
    const bkashIdToken = await getBkashIdToken();

    const response = await fetch(
      `${config.bkash_base_url}/tokenized/checkout/execute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: bkashIdToken,
          "X-App-Key": config.bkash_app_key,
        },
        body: JSON.stringify({
          paymentID,
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error("Bkash payment execution failed");
    //   throw new AppError(
    //     httpStatus.BAD_GATEWAY,
    //     result?.statusMessage ||
    //       "Bkash payment execution failed",
    //   );
    }

    return result;
  } catch (error: any) {
    if (error instanceof Error) {
      throw error;
    }
    // if (error instanceof AppError) {
    //   throw error;
    // }

    throw new Error("Bkash payment execution failed");
    // throw new AppError(
    //   httpStatus.BAD_GATEWAY,
    //   error?.message ||
    //     "Bkash payment execution failed",
    // );
  }
};










// import httpStatus from "http-status";
// import config from "../config";
// import { redisClient } from "./redis";
// import { AppError } from "../utils/AppError";

// export const getBkashIdToken = async () => {
//   try {
//     const idTokenKey = "bkash:idToken";
//     const refreshTokenKey = "bkash:refreshToken";

//     let bkashIdToken = await redisClient.get(idTokenKey);
//     const bkashIdTokenTTL = await redisClient.ttl(idTokenKey);

//     const bkashRefreshToken = await redisClient.get(refreshTokenKey);
//     const bkashRefreshTokenTTL = await redisClient.ttl(refreshTokenKey);

//     // Refresh existing token if it is expired/nearly expired
//     // and refresh token is still valid.
//     if (
//       (bkashIdTokenTTL <= 600 || !bkashIdToken) &&
//       bkashRefreshToken &&
//       bkashRefreshTokenTTL > 600
//     ) {
//       const refreshTokenResponse = await fetch(
//         `${config.bkash_base_url}/tokenized/checkout/token/refresh`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Accept: "application/json",
//             username: config.bkash_username,
//             password: config.bkash_password,
//           },
//           body: JSON.stringify({
//             app_key: config.bkash_app_key,
//             app_secret: config.bkash_app_secret,
//             refresh_token: bkashRefreshToken,
//           }),
//         },
//       );

//       if (!refreshTokenResponse.ok) {
//         throw new AppError(
//           httpStatus.BAD_GATEWAY,
//           "bKash access token refresh failed",
//         );
//       }

//       const refreshResult = await refreshTokenResponse.json();

//       bkashIdToken = refreshResult.id_token as string;

//       await redisClient.set(idTokenKey, bkashIdToken, {
//         expiration: {
//           type: "EX",
//           value: 60 * 60,
//         },
//       });

//       return bkashIdToken;
//     }

//     // Existing token is still usable
//     if (bkashIdToken && bkashIdTokenTTL > 600) {
//       return bkashIdToken;
//     }

//     // Generate a new token
//     const tokenResponse = await fetch(
//       `${config.bkash_base_url}/tokenized/checkout/token/grant`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//           username: config.bkash_username,
//           password: config.bkash_password,
//         },
//         body: JSON.stringify({
//           app_key: config.bkash_app_key,
//           app_secret: config.bkash_app_secret,
//         }),
//       },
//     );

//     if (!tokenResponse.ok) {
//       throw new AppError(
//         httpStatus.BAD_GATEWAY,
//         "bKash access token grant failed",
//       );
//     }

//     const result = await tokenResponse.json();

//     if (!result.id_token || !result.refresh_token) {
//       throw new AppError(
//         httpStatus.BAD_GATEWAY,
//         "Invalid response from bKash token service",
//       );
//     }

//     await redisClient.set(idTokenKey, result.id_token, {
//       expiration: {
//         type: "EX",
//         value: 60 * 60,
//       },
//     });

//     await redisClient.set(refreshTokenKey, result.refresh_token, {
//       expiration: {
//         type: "EX",
//         value: 60 * 60 * 24 * 28,
//       },
//     });

//     return result.id_token as string;
//   } catch (error) {
//     if (error instanceof AppError) {
//       throw error;
//     }

//     const message =
//       error instanceof Error ? error.message : "Unknown bKash error";

//     throw new AppError(httpStatus.BAD_GATEWAY, message);
//   }
// };