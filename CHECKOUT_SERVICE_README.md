# Checkout Service View - Documentation

## Overview

This document explains how the checkout service view (`/checkout/[service_type]/[service_slug]`) works in the application. This view handles the purchase of different types of consumable services.

## Service Types

The application currently supports **4 types of services**:

1. **Cohort-set** - ❌ Not purchasable currently
2. **Mentorship Service Set** - ✅ Purchasable
3. **Event Type Set** - ✅ Purchasable  
4. **Void Services** - ✅ Purchasable (using compilation type)

## URL Structure

```
/checkout/[service_type]/[service_slug]?academy=[academy_id]
```

### Parameters:
- `service_type`: Type of service (`mentorship`, `event`, `compilation`)
- `service_slug`: Service identifier (varies by type)
- `academy` (optional): Academy ID to use for the service lookup

## How Each Service Type Works

### 1. Mentorship Services (`/checkout/mentorship/[mentorship_service_set_slug]`)

**Requirements:**
- User must have the `mentorship_service_set_slug` in their subscriptions
- The slug must be a valid mentorship service set

**Process:**
1. System searches for the mentorship service set in user's subscriptions
2. If found, queries academy services using `mentorship_service_set` parameter
3. Returns the **first academy service** related to that mentorship service set
4. User can purchase that academy service

**Example:**
```
/checkout/mentorship/geekpal-1-1-saas
```

### 2. Event Services (`/checkout/event/[event_type_set_slug]`)

**Requirements:**
- User must have the `event_type_set_slug` in their subscriptions
- The slug must be a valid event type set

**Process:**
1. System searches for the event type set in user's subscriptions
2. If found, queries academy services using `event_type_set` parameter
3. Returns the **first academy service** related to that event type set
4. User can purchase that academy service

**Example:**
```
/checkout/event/workshop-bootcamp
```

### 3. Void Services (`/checkout/compilation/[academy_service_slug]`)

**Requirements:**
- Must use `compilation` as service type (using other types will result in 404)
- The slug must be a valid academy service slug

**Process:**
1. Directly queries the academy service by slug
2. No subscription validation required
3. Returns the specific academy service
4. User can purchase the service

**Example:**
```
/checkout/compilation/build-learnpack
```

## Academy Parameter

You can specify which academy to use by adding the `academy` query parameter:

```
/checkout/mentorship/geekpal-1-1-saas?academy=47
```

**Priority order:**
1. Academy from query parameter (`?academy=47`)
2. Academy from user's first subscription (fallback)

## Error Handling

### No Results Found
When searching for academy services by mentorship service set or event type set:
- If no academy services are found related to the provided slug
- System displays a "No results found" view
- User cannot proceed with purchase

### Subscription Validation
For mentorship and event services:
- User must have the required service set in their subscriptions
- If not found, purchase is not allowed
- System shows appropriate error message

### Invalid Service Types
- Using unsupported service types results in 404 redirect
- Only `mentorship`, `event`, and `compilation` are allowed

## API Endpoints Used

### For Mentorship/Event Services:
```javascript
bc.payment({
  academy: academyId,
  mentorship_service_set: service_slug, // for mentorship
  event_type_set: service_slug,        // for event
  country_code: location?.countryShort,
}).service().getAcademyService()
```

### For Void/Compilation Services:
```javascript
bc.payment({
  academy: academyId,
  country_code: location?.countryShort,
}).service().getAcademyServiceBySlug(service_slug)
```

## Service Display

The system automatically generates display information based on the service data:

- **Service Title**: Uses `service.title` from API, falls back to `unSlugifyCapitalize(service.slug)`
- **Quantity Display**: Shows quantity and service name (e.g., "1 Geekpal Mentorship Session")
- **Price Display**: Shows price per unit (e.g., "$25 per geekpal mentorship session")

## User Flow

1. **Authentication Check**: User must be logged in
2. **Subscription Loading**: System loads user's subscriptions
3. **Service Validation**: Validates service type and slug
4. **Service Lookup**: Queries appropriate API endpoint based on service type
5. **Data Processing**: Processes service data for display
6. **Checkout Display**: Shows service details and payment options
7. **Purchase Flow**: Handles payment processing

## Examples

### Valid URLs:
```
/checkout/mentorship/geekpal-1-1-saas
/checkout/event/workshop-bootcamp  
/checkout/compilation/learnpack-publish
/checkout/compilation/ai-conversation-message?academy=47
```

### Invalid URLs:
```
/checkout/void/ai-conversation-message (404 - wrong service type)
/checkout/cohort/my-cohort (not purchasable)
/checkout/mentorship/invalid-slug (no results if not in subscriptions)
```

## Technical Notes

- Service data is cached and managed through Redux store
- Payment status is tracked throughout the process
- Beforeunload event prevents accidental navigation during payment
- Error states are handled gracefully with retry options
- Internationalization support for all user-facing text
