import React from 'react';
import Subscriptions from '../js_modules/profile/Subscriptions';

export default {
  title: 'Components/Subscriptions',
  component: Subscriptions,
  argTypes: {
    cohorts: { control: 'array' },
    subscriptionData: { control: 'object' },
  },
};

const Component = (args) => {
  const cohorts = args?.cohorts;
  const subscriptionData = args?.subscriptionData;

  return <Subscriptions storybookConfig={{ cohorts, subscriptionData }} />
};

export const isFreeTrial = Component.bind({});
isFreeTrial.args = {
  cohorts: [
    {
        "cohort": {
            "id": 426,
            "slug": "coding-introduction-2",
            "name": "Coding Introduction 2",
            "kickoff_date": "2023-02-25T02:44:33Z",
            "ending_date": "2023-03-25T02:44:37Z",
            "current_day": 1,
            "current_module": null,
            "syllabus_version": {
                "version": 2,
                "status": "PUBLISHED",
                "slug": "coding-introduction",
                "name": "Coding Introduction",
                "syllabus": 31,
                "duration_in_hours": 40,
                "duration_in_days": 5,
                "week_hours": 8,
                "github_url": null,
                "logo": null,
                "private": false
            },
            "academy": {
                "id": 4,
                "slug": "downtown-miami",
                "name": "4Geeks Academy Miami",
                "country": {
                    "code": "us",
                    "name": "USA"
                },
                "city": {
                    "name": "Miami"
                },
                "logo_url": "https://storage.googleapis.com/admissions-breathecode/location-downtown-miami",
                "is_hidden_on_prework": true
            },
            "stage": "PREWORK",
            "is_hidden_on_prework": false,
            "available_as_saas": true
        },
        "role": "STUDENT",
        "finantial_status": "UP_TO_DATE",
        "educational_status": "ACTIVE",
        "created_at": "2023-01-25T00:34:29.957399Z"
    },
  ],
  subscriptionData: {
    "subscriptions": [
        {
            "id": 6,
            "status": "FREE_TRIAL",
            "status_message": null,
            "user": {
                "first_name": "John",
                "last_name": "Doe",
                "email": "john@doe.com"
            },
            "cohort_selected": null,
            "mentorship_service_set_selected": null,
            "event_type_set_selected": null,
            "plans": [
                {
                    "slug": "coding-introduction-2",
                    "status": "ACTIVE",
                    "time_of_life": 0,
                    "time_of_life_unit": null,
                    "trial_duration": 0,
                    "trial_duration_unit": "MONTH",
                    "financing_options": []
                }
            ],
            "selected_cohort_set": {
                "cohorts": [{
                "id": 426,
                "slug": "coding-introduction-2",
                "name": "Coding Introduction 2",
            }]
            },
            "invoices": [
                {
                    "amount": 0,
                    "currency": {
                        "code": "USD",
                        "name": "US Dollar"
                    },
                    "paid_at": "2023-02-24T15:55:49.567456Z",
                    "status": "FULFILLED",
                }
            ],
            "next_payment_at": "2023-02-24T15:55:49Z",
            "valid_until": "2023-02-28T15:55:49Z",
            "paid_at": "2023-02-24T15:55:49Z",
            "is_refundable": true,
            "pay_every": 1,
            "pay_every_unit": "MONTH",
            "service_items": []
        }
    ],
    "plan_financings": []
  }
};

export const isActive = Component.bind({});
isActive.args = {
  cohorts: [
    {
        "cohort": {
            "id": 426,
            "slug": "coding-introduction-2",
            "name": "Coding Introduction 2",
            "kickoff_date": "2023-02-25T02:44:33Z",
            "ending_date": "2023-03-25T02:44:37Z",
            "current_day": 1,
            "current_module": null,
            "syllabus_version": {
                "version": 2,
                "status": "PUBLISHED",
                "slug": "coding-introduction",
                "name": "Coding Introduction",
                "syllabus": 31,
                "duration_in_hours": 40,
                "duration_in_days": 5,
                "week_hours": 8,
                "github_url": null,
                "logo": null,
                "private": false
            },
            "academy": {
                "id": 4,
                "slug": "downtown-miami",
                "name": "4Geeks Academy Miami",
                "country": {
                    "code": "us",
                    "name": "USA"
                },
                "city": {
                    "name": "Miami"
                },
                "logo_url": "https://storage.googleapis.com/admissions-breathecode/location-downtown-miami",
                "is_hidden_on_prework": true
            },
            "stage": "PREWORK",
            "is_hidden_on_prework": false,
            "available_as_saas": true
        },
        "role": "STUDENT",
        "finantial_status": "UP_TO_DATE",
        "educational_status": "ACTIVE",
        "created_at": "2023-01-25T00:34:29.957399Z"
    },
  ],
  subscriptionData: {
    "subscriptions": [
        {
            "id": 6,
            "status": "ACTIVE",
            "status_message": null,
            "user": {
                "first_name": "John",
                "last_name": "Doe",
                "email": "john@doe.com"
            },
            "cohort_selected": null,
            "mentorship_service_set_selected": null,
            "event_type_set_selected": null,
            "plans": [
                {
                    "slug": "coding-introduction-2",
                    "status": "ACTIVE",
                    "time_of_life": 0,
                    "time_of_life_unit": null,
                    "trial_duration": 0,
                    "trial_duration_unit": "MONTH",
                    "financing_options": []
                }
            ],
            "selected_cohort_set": {
                "cohorts": [{
                "id": 426,
                "slug": "coding-introduction-2",
                "name": "Coding Introduction 2",
            }]
            },
            "invoices": [
                {
                    "amount": 200,
                    "currency": {
                        "code": "USD",
                        "name": "US Dollar"
                    },
                    "paid_at": "2023-02-24T15:55:49.567456Z",
                    "status": "FULFILLED",
                }
            ],
            "next_payment_at": "2023-03-24T15:55:49Z",
            "valid_until": "2023-03-24T15:55:49Z",
            "paid_at": "2023-02-24T15:55:49Z",
            "is_refundable": true,
            "pay_every": 1,
            "pay_every_unit": "MONTH",
            "service_items": []
        }
    ],
    "plan_financings": []
  }
};


export const isCancelled = Component.bind({});
isCancelled.args = {
  cohorts: [
    {
        "cohort": {
            "id": 426,
            "slug": "coding-introduction-2",
            "name": "Coding Introduction 2",
            "kickoff_date": "2023-02-25T02:44:33Z",
            "ending_date": "2023-03-25T02:44:37Z",
            "current_day": 1,
            "current_module": null,
            "syllabus_version": {
                "version": 2,
                "status": "PUBLISHED",
                "slug": "coding-introduction",
                "name": "Coding Introduction",
                "syllabus": 31,
                "duration_in_hours": 40,
                "duration_in_days": 5,
                "week_hours": 8,
                "github_url": null,
                "logo": null,
                "private": false
            },
            "academy": {
                "id": 4,
                "slug": "downtown-miami",
                "name": "4Geeks Academy Miami",
                "country": {
                    "code": "us",
                    "name": "USA"
                },
                "city": {
                    "name": "Miami"
                },
                "logo_url": "https://storage.googleapis.com/admissions-breathecode/location-downtown-miami",
                "is_hidden_on_prework": true
            },
            "stage": "PREWORK",
            "is_hidden_on_prework": false,
            "available_as_saas": true
        },
        "role": "STUDENT",
        "finantial_status": "UP_TO_DATE",
        "educational_status": "ACTIVE",
        "created_at": "2023-01-25T00:34:29.957399Z"
    },
  ],
  subscriptionData: {
    "subscriptions": [
        {
            "id": 6,
            "status": "CANCELLED",
            "status_message": null,
            "user": {
                "first_name": "John",
                "last_name": "Doe",
                "email": "john@doe.com"
            },
            "cohort_selected": null,
            "mentorship_service_set_selected": null,
            "event_type_set_selected": null,
            "plans": [
                {
                    "slug": "coding-introduction-2",
                    "status": "ACTIVE",
                    "time_of_life": 0,
                    "time_of_life_unit": null,
                    "trial_duration": 0,
                    "trial_duration_unit": "MONTH",
                    "financing_options": []
                }
            ],
            "selected_cohort_set": {
                "cohorts": [{
                "id": 426,
                "slug": "coding-introduction-2",
                "name": "Coding Introduction 2",
            }]
            },
            "invoices": [
                {
                    "amount": 200,
                    "currency": {
                        "code": "USD",
                        "name": "US Dollar"
                    },
                    "paid_at": "2023-02-24T15:55:49.567456Z",
                    "status": "FULFILLED",
                }
            ],
            "next_payment_at": "2023-03-24T15:55:49Z",
            "valid_until": "2023-03-24T15:55:49Z",
            "paid_at": "2023-02-24T15:55:49Z",
            "is_refundable": false,
            "pay_every": 1,
            "pay_every_unit": "MONTH",
            "service_items": []
        }
    ],
    "plan_financings": []
  }
};
export const isPaymentUpToDate = Component.bind({});
isPaymentUpToDate.args = {
  cohorts: [
    {
        "cohort": {
            "id": 426,
            "slug": "coding-introduction-2",
            "name": "Coding Introduction 2",
            "kickoff_date": "2023-02-25T02:44:33Z",
            "ending_date": "2023-03-25T02:44:37Z",
            "current_day": 1,
            "current_module": null,
            "syllabus_version": {
                "version": 2,
                "status": "PUBLISHED",
                "slug": "coding-introduction",
                "name": "Coding Introduction",
                "syllabus": 31,
                "duration_in_hours": 40,
                "duration_in_days": 5,
                "week_hours": 8,
                "github_url": null,
                "logo": null,
                "private": false
            },
            "academy": {
                "id": 4,
                "slug": "downtown-miami",
                "name": "4Geeks Academy Miami",
                "country": {
                    "code": "us",
                    "name": "USA"
                },
                "city": {
                    "name": "Miami"
                },
                "logo_url": "https://storage.googleapis.com/admissions-breathecode/location-downtown-miami",
                "is_hidden_on_prework": true
            },
            "stage": "PREWORK",
            "is_hidden_on_prework": false,
            "available_as_saas": true
        },
        "role": "STUDENT",
        "finantial_status": "UP_TO_DATE",
        "educational_status": "ACTIVE",
        "created_at": "2023-01-25T00:34:29.957399Z"
    },
  ],
  subscriptionData: {
    "subscriptions": [
        {
            "id": 6,
            "status": "ACTIVE",
            "status_message": null,
            "user": {
                "first_name": "John",
                "last_name": "Doe",
                "email": "john@doe.com"
            },
            "cohort_selected": null,
            "mentorship_service_set_selected": null,
            "event_type_set_selected": null,
            "plans": [
                {
                    "slug": "coding-introduction-2",
                    "status": "ACTIVE",
                    "time_of_life": 0,
                    "time_of_life_unit": null,
                    "trial_duration": 0,
                    "trial_duration_unit": "MONTH",
                    "financing_options": []
                }
            ],
            "selected_cohort_set": {
                "cohorts": [{
                "id": 426,
                "slug": "coding-introduction-2",
                "name": "Coding Introduction 2",
            }]
            },
            "invoices": [
                {
                    "amount": 200,
                    "currency": {
                        "code": "USD",
                        "name": "US Dollar"
                    },
                    "paid_at": "2023-02-24T15:55:49.567456Z",
                    "status": "FULFILLED",
                }
            ],
            "next_payment_at": "2023-02-28T15:55:49Z",
            "valid_until": "2023-04-28T15:55:49Z",
            "paid_at": "2023-02-24T15:55:49Z",
            "is_refundable": false,
            "pay_every": 1,
            "pay_every_unit": "MONTH",
            "service_items": []
        }
    ],
    "plan_financings": []
  }
};
export const PaymentIssue = Component.bind({});
PaymentIssue.args = {
  cohorts: [
    {
        "cohort": {
            "id": 426,
            "slug": "coding-introduction-2",
            "name": "Coding Introduction 2",
            "kickoff_date": "2023-02-25T02:44:33Z",
            "ending_date": "2023-03-25T02:44:37Z",
            "current_day": 1,
            "current_module": null,
            "syllabus_version": {
                "version": 2,
                "status": "PUBLISHED",
                "slug": "coding-introduction",
                "name": "Coding Introduction",
                "syllabus": 31,
                "duration_in_hours": 40,
                "duration_in_days": 5,
                "week_hours": 8,
                "github_url": null,
                "logo": null,
                "private": false
            },
            "academy": {
                "id": 4,
                "slug": "downtown-miami",
                "name": "4Geeks Academy Miami",
                "country": {
                    "code": "us",
                    "name": "USA"
                },
                "city": {
                    "name": "Miami"
                },
                "logo_url": "https://storage.googleapis.com/admissions-breathecode/location-downtown-miami",
                "is_hidden_on_prework": true
            },
            "stage": "PREWORK",
            "is_hidden_on_prework": false,
            "available_as_saas": true
        },
        "role": "STUDENT",
        "finantial_status": "UP_TO_DATE",
        "educational_status": "ACTIVE",
        "created_at": "2023-01-25T00:34:29.957399Z"
    },
  ],
  subscriptionData: {
    "subscriptions": [
        {
            "id": 6,
            "status": "PAYMENT_ISSUE",
            "status_message": null,
            "user": {
                "first_name": "John",
                "last_name": "Doe",
                "email": "john@doe.com"
            },
            "cohort_selected": null,
            "mentorship_service_set_selected": null,
            "event_type_set_selected": null,
            "plans": [
                {
                    "slug": "coding-introduction-2",
                    "status": "ACTIVE",
                    "time_of_life": 0,
                    "time_of_life_unit": null,
                    "trial_duration": 0,
                    "trial_duration_unit": "MONTH",
                    "financing_options": []
                }
            ],
            "selected_cohort_set": {
                "cohorts": [{
                "id": 426,
                "slug": "coding-introduction-2",
                "name": "Coding Introduction 2",
            }]
            },
            "invoices": [
                {
                    "amount": 200,
                    "currency": {
                        "code": "USD",
                        "name": "US Dollar"
                    },
                    "paid_at": "2023-02-24T15:55:49.567456Z",
                    "status": "FULFILLED",
                }
            ],
            "next_payment_at": "2023-02-28T15:55:49Z",
            "valid_until": "2023-04-28T15:55:49Z",
            "paid_at": "2023-02-24T15:55:49Z",
            "is_refundable": false,
            "pay_every": 1,
            "pay_every_unit": "MONTH",
            "service_items": []
        }
    ],
    "plan_financings": []
  }
};
export const FullyPaid = Component.bind({});
FullyPaid.args = {
  cohorts: [
    {
        "cohort": {
            "id": 426,
            "slug": "coding-introduction-2",
            "name": "Coding Introduction 2",
            "kickoff_date": "2023-02-25T02:44:33Z",
            "ending_date": "2023-03-25T02:44:37Z",
            "current_day": 1,
            "current_module": null,
            "syllabus_version": {
                "version": 2,
                "status": "PUBLISHED",
                "slug": "coding-introduction",
                "name": "Coding Introduction",
                "syllabus": 31,
                "duration_in_hours": 40,
                "duration_in_days": 5,
                "week_hours": 8,
                "github_url": null,
                "logo": null,
                "private": false
            },
            "academy": {
                "id": 4,
                "slug": "downtown-miami",
                "name": "4Geeks Academy Miami",
                "country": {
                    "code": "us",
                    "name": "USA"
                },
                "city": {
                    "name": "Miami"
                },
                "logo_url": "https://storage.googleapis.com/admissions-breathecode/location-downtown-miami",
                "is_hidden_on_prework": true
            },
            "stage": "PREWORK",
            "is_hidden_on_prework": false,
            "available_as_saas": true
        },
        "role": "STUDENT",
        "finantial_status": "UP_TO_DATE",
        "educational_status": "ACTIVE",
        "created_at": "2023-01-25T00:34:29.957399Z"
    },
  ],
  subscriptionData: {
    "subscriptions": [
        {
            "id": 6,
            "status": "FULLY_PAID",
            "status_message": null,
            "user": {
                "first_name": "John",
                "last_name": "Doe",
                "email": "john@doe.com"
            },
            "cohort_selected": null,
            "mentorship_service_set_selected": null,
            "event_type_set_selected": null,
            "plans": [
                {
                    "slug": "coding-introduction-2",
                    "status": "ACTIVE",
                    "time_of_life": 0,
                    "time_of_life_unit": null,
                    "trial_duration": 0,
                    "trial_duration_unit": "MONTH",
                    "financing_options": []
                }
            ],
            "selected_cohort_set": {
                "cohorts": [{
                "id": 426,
                "slug": "coding-introduction-2",
                "name": "Coding Introduction 2",
            }]
            },
            "invoices": [
                {
                    "amount": 200,
                    "currency": {
                        "code": "USD",
                        "name": "US Dollar"
                    },
                    "paid_at": "2023-02-24T15:55:49.567456Z",
                    "status": "FULFILLED",
                }
            ],
            "next_payment_at": "2023-02-28T15:55:49Z",
            "valid_until": "2023-04-28T15:55:49Z",
            "paid_at": "2023-02-24T15:55:49Z",
            "is_refundable": false,
            "pay_every": 1,
            "pay_every_unit": "MONTH",
            "service_items": []
        }
    ],
    "plan_financings": []
  }
};