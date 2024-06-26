import { QueryResult, QueryResultRow } from "pg";
import { ResponseError } from "src/utils/response-error";
import { FormattedAttributes } from "src/types/format";
import log from "src/utils/log";

function formatAttributes(result: QueryResult[]): FormattedAttributes {
  const [event, user] = [
    getDistinctAttributes(result[0]),
    getDistinctAttributes(result[1]),
  ];

  let attributeObj: FormattedAttributes = {
    event,
    user,
  };

  return attributeObj;
}

interface Attributes {
  [key: string]: string[];
}

interface ParsedJson {
  [key: string]: unknown;
}

function getDistinctAttributes(attributeArr: QueryResult): Attributes {
  const formattedAttributes: Attributes = {};
  attributeArr.rows.forEach((row: QueryResultRow) => {
    let attributes: ParsedJson = {};

    try {
      attributes = JSON.parse(row.json_serialize);
    } catch (error) {
      if (error instanceof Error) {
        const logMessage =
          "Error when parsing attributes as JSON" + error.message;
        log.info(logMessage);
        throw new ResponseError({
          message:
            "There was an unexpected error while trying to retrieve attributes.",
          statusCode: 500,
        });
      }
    }

    for (let attribute in attributes) {
      const value = attributes[attribute];
      if (!formattedAttributes.hasOwnProperty(attribute)) {
        formattedAttributes[attribute] = [];
      }
      if (
        typeof value === "string" &&
        !formattedAttributes[attribute].includes(value)
      ) {
        formattedAttributes[attribute].push(String(value));
      }
    }
  });

  return formattedAttributes;
}

export default formatAttributes;
