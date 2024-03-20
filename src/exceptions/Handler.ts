import postgres from "postgres";

let thisCode: string;
let thisStatus: number;
let thisMessage: string;

export const handler = (
  error: any,
  code: string | null = null,
  message: string | null = null
) => {
  thisCode = code ? code : error.code;
  thisStatus = error.status;
  thisMessage = message ? message : error.message;

  if (!thisCode || !thisStatus || !thisMessage) handleError(error);

  return {
    status: thisStatus,
    message: thisCode + thisMessage,
  };
};

const handleError = (error: {
  code: string;
  status: number;
  message: string;
}) => {
  if (error.status === 400) thisCode = "BAD_REQUEST";
  else if (error.status === 500) {
    thisCode = "INTERNAL_ERROR";
    thisMessage = "Ocorreu um erro inesperado!";
  }
  if (error instanceof postgres.PostgresError) {
    if (error.code === "23505") {
      thisMessage = "Duplicated CODE.";
    }
  }
};
