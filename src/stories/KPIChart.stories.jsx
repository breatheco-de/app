import React from 'react';
import KPI from '../common/components/KPI';
import Sparkline from '../common/components/Sparkline';

export default {
  title: 'Components/KPIChart',
  component: 'KPIChart',
  argTypes: {}
};

const Component = (args) => {
  const allStudentsWithDays = args.allStudentsWithDays;
  const calcPercentage = (number, total) => {
    const percentage = (number / total) * 100;
    return Number(percentage.toFixed(2));
  };

  const calcStudentDaysAverage = () => {
    let finalPercentage = 0;

    allStudentsWithDays.studentList.forEach((student) => {
      finalPercentage += student.percentage;
    });
    const percentage = calcPercentage((finalPercentage / 100), allStudentsWithDays.studentList.length);
    const percentageLimited = percentage > 100 ? 100 : percentage;

    return percentageLimited;
  };
  return (
    <KPI
      label={args.label}
      value={calcStudentDaysAverage()}
      valueUnit="%"
      delta={null}
      deltaLabel={null}
      chart={(
        <Sparkline
          width={args.sparklineConfig.width}
          // containerWidth="200px"
          height={args.sparklineConfig.height}
          values={allStudentsWithDays.averageEachDay}
          {...args.sparklineConfig}
        />
      )}
      unstyled
      {...args}
    />
  );
};
export const Default = Component.bind({});
Default.args = {
  label: 'Attendance',
  allStudentsWithDays: {
    studentList: [
      {
          "user": {
              "id": 1,
              "first_name": "Jhon",
              "last_name": "Doe",
              "email": "testmail@gmail.com",
              "profile": {
                  "id": 1234,
                  "avatar_url": "",
                  "show_tutorial": false,
                  "github_username": null
              }
          },
          "days": [
              {
                  "label": "Day 1 - 24 Nov",
                  "day": 1,
                  "color": "#FF5B5B",
                  "updated_at": "2022-11-24 14:08:30.653497+00:00"
              },
              {
                  "label": "Day 2 - 24 Nov",
                  "day": 2,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-24 14:00:43.498144+00:00"
              },
              {
                  "label": "Day 3 - 24 Nov",
                  "day": 3,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-24 03:19:21.626492+00:00"
              },
              {
                  "label": "Day 4 - 24 Nov",
                  "day": 4,
                  "color": "#FF5B5B",
                  "updated_at": "2022-11-24 03:36:02.981249+00:00"
              },
              {
                  "label": "Day 5 - 10 Nov",
                  "day": 5,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721838+00:00"
              },
              {
                  "label": "Day 6 - 24 Nov",
                  "day": 6,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-24 03:38:10.924999+00:00"
              },
              {
                  "label": "Day 7 - 10 Nov",
                  "day": 7,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721849+00:00"
              },
              {
                  "label": "Day 8 - 10 Nov",
                  "day": 8,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721854+00:00"
              },
              {
                  "label": "Day 9 - 10 Nov",
                  "day": 9,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721859+00:00"
              },
              {
                  "label": "Day 10 - 10 Nov",
                  "day": 10,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721865+00:00"
              },
              {
                  "label": "Day 11 - 10 Nov",
                  "day": 11,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721870+00:00"
              },
              {
                  "label": "Day 12 - 10 Nov",
                  "day": 12,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721876+00:00"
              },
              {
                  "label": "Day 13 - 10 Nov",
                  "day": 13,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721881+00:00"
              },
              {
                  "label": "Day 14 - 10 Nov",
                  "day": 14,
                  "color": "#FF5B5B",
                  "updated_at": "2022-11-10 17:31:51.596955+00:00"
              },
              {
                  "label": "Day 15 - 10 Nov",
                  "day": 15,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-10 17:57:29.922390+00:00"
              },
              {
                  "label": "Day 16 - 10 Nov",
                  "day": 16,
                  "color": "#FF5B5B",
                  "updated_at": "2022-11-10 19:10:59.423461+00:00"
              },
              {
                  "label": "Day 17 - 18 Nov",
                  "day": 17,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-18 14:42:18.346605+00:00"
              },
              {
                  "label": "Day 18 - 23 Nov",
                  "day": 18,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-24 02:33:12.333072+00:00"
              },
              {
                  "label": "Day 19 - 21 Nov",
                  "day": 19,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-21 18:40:40.425294+00:00"
              },
              {
                  "label": "Day 20 - 18 Nov",
                  "day": 20,
                  "color": "#FFB718",
                  "updated_at": "2022-11-18 21:56:51.515038+00:00"
              },
              {
                  "label": "Day 21 - 18 Nov",
                  "day": 21,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-18 21:56:51.515545+00:00"
              },
              {
                  "label": "Day 22 - 18 Nov",
                  "day": 22,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-18 21:57:17.709526+00:00"
              },
              {
                  "label": "Day 23 - 21 Nov",
                  "day": 23,
                  "color": "#FFB718",
                  "updated_at": "2022-11-21 18:30:24.570216+00:00"
              },
              {
                  "label": "Day 24 - 21 Nov",
                  "day": 24,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-21 18:40:13.371825+00:00"
              },
              {
                  "label": "Day 25 - 21 Nov",
                  "day": 25,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-21 18:40:03.128271+00:00"
              },
              {
                  "label": "Day 26 - 21 Nov",
                  "day": 26,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-21 18:30:24.570298+00:00"
              },
              {
                  "label": "Day 27 - 21 Nov",
                  "day": 27,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-21 19:09:19.853653+00:00"
              },
              {
                  "label": "Day 28 - 24 Nov",
                  "day": 28,
                  "color": "#FF5B5B",
                  "updated_at": "2022-11-24 03:38:55.305023+00:00"
              },
              {
                  "label": "Day 29",
                  "day": 29,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 30",
                  "day": 30,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 31",
                  "day": 31,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 32",
                  "day": 32,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 33",
                  "day": 33,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 34",
                  "day": 34,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 35",
                  "day": 35,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 36",
                  "day": 36,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 37",
                  "day": 37,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 38",
                  "day": 38,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 39",
                  "day": 39,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 40",
                  "day": 40,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 41",
                  "day": 41,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 42",
                  "day": 42,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 43",
                  "day": 43,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 44",
                  "day": 44,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 45",
                  "day": 45,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 46",
                  "day": 46,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 47",
                  "day": 47,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 48",
                  "day": 48,
                  "color": "#C4C4C4",
                  "updated_at": null
              }
          ],
          "percentage": 27
      },
      {
          "user": {
              "id": 2,
              "first_name": "Sara",
              "last_name": "Smith",
              "email": "sara.smith@gmail.com",
              "profile": {
                  "id": 2345,
                  "avatar_url": "",
                  "show_tutorial": false,
                  "github_username": ""
              }
          },
          "days": [
              {
                  "label": "Day 1 - 24 Nov",
                  "day": 1,
                  "color": "#FF5B5B",
                  "updated_at": "2022-11-24 14:08:30.653497+00:00"
              },
              {
                  "label": "Day 2 - 24 Nov",
                  "day": 2,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-24 14:00:43.498144+00:00"
              },
              {
                  "label": "Day 3 - 24 Nov",
                  "day": 3,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-24 03:19:21.626492+00:00"
              },
              {
                  "label": "Day 4 - 24 Nov",
                  "day": 4,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-24 03:36:02.981249+00:00"
              },
              {
                  "label": "Day 5 - 10 Nov",
                  "day": 5,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721838+00:00"
              },
              {
                  "label": "Day 6 - 24 Nov",
                  "day": 6,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-24 03:38:10.924999+00:00"
              },
              {
                  "label": "Day 7 - 10 Nov",
                  "day": 7,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721849+00:00"
              },
              {
                  "label": "Day 8 - 10 Nov",
                  "day": 8,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721854+00:00"
              },
              {
                  "label": "Day 9 - 10 Nov",
                  "day": 9,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721859+00:00"
              },
              {
                  "label": "Day 10 - 10 Nov",
                  "day": 10,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721865+00:00"
              },
              {
                  "label": "Day 11 - 10 Nov",
                  "day": 11,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721870+00:00"
              },
              {
                  "label": "Day 12 - 10 Nov",
                  "day": 12,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721876+00:00"
              },
              {
                  "label": "Day 13 - 10 Nov",
                  "day": 13,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721881+00:00"
              },
              {
                  "label": "Day 14 - 10 Nov",
                  "day": 14,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-10 17:31:51.596955+00:00"
              },
              {
                  "label": "Day 15 - 10 Nov",
                  "day": 15,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-10 17:57:29.922390+00:00"
              },
              {
                  "label": "Day 16 - 10 Nov",
                  "day": 16,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-10 19:10:59.423461+00:00"
              },
              {
                  "label": "Day 17 - 18 Nov",
                  "day": 17,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-18 14:42:18.346605+00:00"
              },
              {
                  "label": "Day 18 - 23 Nov",
                  "day": 18,
                  "color": "#FF5B5B",
                  "updated_at": "2022-11-24 02:33:12.333072+00:00"
              },
              {
                  "label": "Day 19 - 21 Nov",
                  "day": 19,
                  "color": "#FF5B5B",
                  "updated_at": "2022-11-21 18:40:40.425294+00:00"
              },
              {
                  "label": "Day 20 - 18 Nov",
                  "day": 20,
                  "color": "#FFB718",
                  "updated_at": "2022-11-18 21:56:51.515038+00:00"
              },
              {
                  "label": "Day 21 - 18 Nov",
                  "day": 21,
                  "color": "#FF5B5B",
                  "updated_at": "2022-11-18 21:56:51.515545+00:00"
              },
              {
                  "label": "Day 22 - 18 Nov",
                  "day": 22,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-18 21:57:17.709526+00:00"
              },
              {
                  "label": "Day 23 - 21 Nov",
                  "day": 23,
                  "color": "#FFB718",
                  "updated_at": "2022-11-21 18:30:24.570216+00:00"
              },
              {
                  "label": "Day 24 - 21 Nov",
                  "day": 24,
                  "color": "#FF5B5B",
                  "updated_at": "2022-11-21 18:40:13.371825+00:00"
              },
              {
                  "label": "Day 25 - 21 Nov",
                  "day": 25,
                  "color": "#FF5B5B",
                  "updated_at": "2022-11-21 18:40:03.128271+00:00"
              },
              {
                  "label": "Day 26 - 21 Nov",
                  "day": 26,
                  "color": "#FF5B5B",
                  "updated_at": "2022-11-21 18:30:24.570298+00:00"
              },
              {
                  "label": "Day 27 - 21 Nov",
                  "day": 27,
                  "color": "#FF5B5B",
                  "updated_at": "2022-11-21 19:09:19.853653+00:00"
              },
              {
                  "label": "Day 28 - 24 Nov",
                  "day": 28,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-24 03:38:55.305023+00:00"
              },
              {
                  "label": "Day 29",
                  "day": 29,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 30",
                  "day": 30,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 31",
                  "day": 31,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 32",
                  "day": 32,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 33",
                  "day": 33,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 34",
                  "day": 34,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 35",
                  "day": 35,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 36",
                  "day": 36,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 37",
                  "day": 37,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 38",
                  "day": 38,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 39",
                  "day": 39,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 40",
                  "day": 40,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 41",
                  "day": 41,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 42",
                  "day": 42,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 43",
                  "day": 43,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 44",
                  "day": 44,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 45",
                  "day": 45,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 46",
                  "day": 46,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 47",
                  "day": 47,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 48",
                  "day": 48,
                  "color": "#C4C4C4",
                  "updated_at": null
              }
          ],
          "percentage": 20
      },
      {
          "user": {
              "id": 456,
              "first_name": "John",
              "last_name": "Doe",
              "email": "john.doe@gmail.com"
          },
          "days": [
              {
                  "label": "Day 1 - 24 Nov",
                  "day": 1,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-24 14:08:30.653497+00:00"
              },
              {
                  "label": "Day 2 - 24 Nov",
                  "day": 2,
                  "color": "#FF5B5B",
                  "updated_at": "2022-11-24 14:00:43.498144+00:00"
              },
              {
                  "label": "Day 3 - 24 Nov",
                  "day": 3,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-24 03:19:21.626492+00:00"
              },
              {
                  "label": "Day 4 - 24 Nov",
                  "day": 4,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-24 03:36:02.981249+00:00"
              },
              {
                  "label": "Day 5 - 10 Nov",
                  "day": 5,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721838+00:00"
              },
              {
                  "label": "Day 6 - 24 Nov",
                  "day": 6,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-24 03:38:10.924999+00:00"
              },
              {
                  "label": "Day 7 - 10 Nov",
                  "day": 7,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721849+00:00"
              },
              {
                  "label": "Day 8 - 10 Nov",
                  "day": 8,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721854+00:00"
              },
              {
                  "label": "Day 9 - 10 Nov",
                  "day": 9,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721859+00:00"
              },
              {
                  "label": "Day 10 - 10 Nov",
                  "day": 10,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721865+00:00"
              },
              {
                  "label": "Day 11 - 10 Nov",
                  "day": 11,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721870+00:00"
              },
              {
                  "label": "Day 12 - 10 Nov",
                  "day": 12,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721876+00:00"
              },
              {
                  "label": "Day 13 - 10 Nov",
                  "day": 13,
                  "color": "#FFB718",
                  "updated_at": "2022-11-10 17:29:39.721881+00:00"
              },
              {
                  "label": "Day 14 - 10 Nov",
                  "day": 14,
                  "color": "#FF5B5B",
                  "updated_at": "2022-11-10 17:31:51.596955+00:00"
              },
              {
                  "label": "Day 15 - 10 Nov",
                  "day": 15,
                  "color": "#FF5B5B",
                  "updated_at": "2022-11-10 17:57:29.922390+00:00"
              },
              {
                  "label": "Day 16 - 10 Nov",
                  "day": 16,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-10 19:10:59.423461+00:00"
              },
              {
                  "label": "Day 17 - 18 Nov",
                  "day": 17,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-18 14:42:18.346605+00:00"
              },
              {
                  "label": "Day 18 - 23 Nov",
                  "day": 18,
                  "color": "#FF5B5B",
                  "updated_at": "2022-11-24 02:33:12.333072+00:00"
              },
              {
                  "label": "Day 19 - 21 Nov",
                  "day": 19,
                  "color": "#FF5B5B",
                  "updated_at": "2022-11-21 18:40:40.425294+00:00"
              },
              {
                  "label": "Day 20 - 18 Nov",
                  "day": 20,
                  "color": "#FFB718",
                  "updated_at": "2022-11-18 21:56:51.515038+00:00"
              },
              {
                  "label": "Day 21 - 18 Nov",
                  "day": 21,
                  "color": "#FF5B5B",
                  "updated_at": "2022-11-18 21:56:51.515545+00:00"
              },
              {
                  "label": "Day 22 - 18 Nov",
                  "day": 22,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-18 21:57:17.709526+00:00"
              },
              {
                  "label": "Day 23 - 21 Nov",
                  "day": 23,
                  "color": "#FFB718",
                  "updated_at": "2022-11-21 18:30:24.570216+00:00"
              },
              {
                  "label": "Day 24 - 21 Nov",
                  "day": 24,
                  "color": "#FF5B5B",
                  "updated_at": "2022-11-21 18:40:13.371825+00:00"
              },
              {
                  "label": "Day 25 - 21 Nov",
                  "day": 25,
                  "color": "#FF5B5B",
                  "updated_at": "2022-11-21 18:40:03.128271+00:00"
              },
              {
                  "label": "Day 26 - 21 Nov",
                  "day": 26,
                  "color": "#FF5B5B",
                  "updated_at": "2022-11-21 18:30:24.570298+00:00"
              },
              {
                  "label": "Day 27 - 21 Nov",
                  "day": 27,
                  "color": "#FF5B5B",
                  "updated_at": "2022-11-21 19:09:19.853653+00:00"
              },
              {
                  "label": "Day 28 - 24 Nov",
                  "day": 28,
                  "color": "#25BF6C",
                  "updated_at": "2022-11-24 03:38:55.305023+00:00"
              },
              {
                  "label": "Day 29",
                  "day": 29,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 30",
                  "day": 30,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 31",
                  "day": 31,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 32",
                  "day": 32,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 33",
                  "day": 33,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 34",
                  "day": 34,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 35",
                  "day": 35,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 36",
                  "day": 36,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 37",
                  "day": 37,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 38",
                  "day": 38,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 39",
                  "day": 39,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 40",
                  "day": 40,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 41",
                  "day": 41,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 42",
                  "day": 42,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 43",
                  "day": 43,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 44",
                  "day": 44,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 45",
                  "day": 45,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 46",
                  "day": 46,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 47",
                  "day": 47,
                  "color": "#C4C4C4",
                  "updated_at": null
              },
              {
                  "label": "Day 48",
                  "day": 48,
                  "color": "#C4C4C4",
                  "updated_at": null
              }
          ],
          "percentage": 16
      },
    ],
    averageEachDay: [
      {
          "day": 5,
          "value": 0,
          "date": "2022-11-10 17:29:39.721838+00:00"
      },
      {
          "day": 7,
          "value": 0,
          "date": "2022-11-10 17:29:39.721849+00:00"
      },
      {
          "day": 8,
          "value": 0,
          "date": "2022-11-10 17:29:39.721854+00:00"
      },
      {
          "day": 9,
          "value": 0,
          "date": "2022-11-10 17:29:39.721859+00:00"
      },
      {
          "day": 10,
          "value": 0,
          "date": "2022-11-10 17:29:39.721865+00:00"
      },
      {
          "day": 11,
          "value": 0,
          "date": "2022-11-10 17:29:39.721870+00:00"
      },
      {
          "day": 12,
          "value": 0,
          "date": "2022-11-10 17:29:39.721876+00:00"
      },
      {
          "day": 13,
          "value": 0,
          "date": "2022-11-10 17:29:39.721881+00:00"
      },
      {
          "day": 14,
          "value": 8,
          "date": "2022-11-10 17:31:51.596955+00:00"
      },
      {
          "day": 15,
          "value": 23,
          "date": "2022-11-10 17:57:29.922390+00:00"
      },
      {
          "day": 16,
          "value": 15,
          "date": "2022-11-10 19:10:59.423461+00:00"
      },
      {
          "day": 17,
          "value": 100,
          "date": "2022-11-18 14:42:18.346605+00:00"
      },
      {
          "day": 20,
          "value": 0,
          "date": "2022-11-18 21:56:51.515038+00:00"
      },
      {
          "day": 21,
          "value": 8,
          "date": "2022-11-18 21:56:51.515545+00:00"
      },
      {
          "day": 22,
          "value": 38,
          "date": "2022-11-18 21:57:17.709526+00:00"
      },
      {
          "day": 23,
          "value": 0,
          "date": "2022-11-21 18:30:24.570216+00:00"
      },
      {
          "day": 26,
          "value": 8,
          "date": "2022-11-21 18:30:24.570298+00:00"
      },
      {
          "day": 25,
          "value": 8,
          "date": "2022-11-21 18:40:03.128271+00:00"
      },
      {
          "day": 24,
          "value": 8,
          "date": "2022-11-21 18:40:13.371825+00:00"
      },
      {
          "day": 19,
          "value": 8,
          "date": "2022-11-21 18:40:40.425294+00:00"
      },
      {
          "day": 27,
          "value": 8,
          "date": "2022-11-21 19:09:19.853653+00:00"
      },
      {
          "day": 18,
          "value": 38,
          "date": "2022-11-24 02:33:12.333072+00:00"
      },
      {
          "day": 3,
          "value": 100,
          "date": "2022-11-24 03:19:21.626492+00:00"
      },
      {
          "day": 4,
          "value": 54,
          "date": "2022-11-24 03:36:02.981249+00:00"
      },
      {
          "day": 6,
          "value": 77,
          "date": "2022-11-24 03:38:10.924999+00:00"
      },
      {
          "day": 28,
          "value": 62,
          "date": "2022-11-24 03:38:55.305023+00:00"
      },
      {
          "day": 2,
          "value": 92,
          "date": "2022-11-24 14:00:43.498144+00:00"
      },
      {
          "day": 1,
          "value": 31,
          "date": "2022-11-24 14:08:30.653497+00:00"
      }
    ]
  },
  fontSize: 'l',
  labelSize: '15px',
  sparklineConfig: {
    tooltipContent: "{value}% - {date}",
    circleWidth: 3,
    interactive: true,
    width: 300,
    height: 60,
    chartStyle: {
      top: '-35px',
      left: '5px',
    },
    strokeWidth: 3,
    strokeDasharray: 0,
    strokeDashoffset: 0,
    backgroundColor: 'inherit',
    fillColor: 'none',
    strokeColor: '#0097CD',
    lineWidth: 2,
    containerWidth: '300px',
  }
};
