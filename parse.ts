import axios from "axios";
import * as ical from "node-ical";

async function parseICS(url: string, dateToCheck: Date): Promise<string> {
  try {
    // Replace 'webcal' with 'http'
    url = url.replace("webcal", "http");

    const response = await axios.get(url);
    const data = response.data;
    const holidayData = ical.parseICS(data);

    let matchingSummary: string = "";

    for (const eventId in holidayData) {
      if (holidayData.hasOwnProperty(eventId)) {
        const holidayInfo = holidayData[eventId];

        if (
          holidayInfo.type === "VEVENT" &&
          isSameDate(holidayInfo.start, dateToCheck)
        ) {
          // Check if the start date matches dateToCheck
          matchingSummary = holidayInfo.summary;
          break;
        } else if (holidayInfo.type !== "VEVENT") {
          matchingSummary = "Everyone is due in work today";
          break;
        }
      }
    }

    // Return the matching summary (or null if no match was found)
    return matchingSummary;
  } catch (error) {
    console.error(error);
    // Return null in case of an error
    return "null";
  }
}

// Function to check if two dates are the same
function isSameDate(date1: Date, date2: Date): boolean {
  return date1.toISOString() === date2.toISOString();
}

// Example usage
(async () => {
  // the webcal URL
  const url: string =
    "webcal://app.timeoff.management/feed/ad4c2427-f2ec-45b5-b91b-2759a2dc1dbc/ical.ics";

  // Create a new date to check
  const dateToCheck: Date = new Date(2024, 0, 20);

  try {
    const matchingSummary = await parseICS(url, dateToCheck);

    if (matchingSummary !== "Everyone is due in work today") {
      console.log("Matching Summary:", matchingSummary, "is on vacation");
    } else {
      console.log(matchingSummary);
    }
  } catch (error) {
    console.error(error);
  }
})();
