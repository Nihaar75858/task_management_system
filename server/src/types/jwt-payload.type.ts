export type JwtPayload = {
  sub: string; // user id
  email: string;
};

export type RequestUser = {
  id: string;
  email: string;
};

export type RequestUserWithRefreshToken = RequestUser & {
  refreshToken: string;
};
