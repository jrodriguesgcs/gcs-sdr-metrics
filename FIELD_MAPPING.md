# ActiveCampaign Field ID Mapping

This document maps the custom field IDs used in the application to their corresponding fields in ActiveCampaign.

## Deal Custom Fields

| Field Name | Field ID | Used For | Tab |
|------------|----------|----------|-----|
| **SDR Agent** | 74 | Filtering deals by agent (Ana Pascoal / Ruffa Espejon) | Both |
| **DISTRIBUTION Time** | 15 | Date filter for distribution metrics | Tab 1 & 2 |
| **Lost Date Time** | 89 | Date filter for lost deals | Tab 2 |
| **Partner** | 20 | Partner assignment tracking | Tab 1 |
| **MQL Lost Reason** | 55 | Lost deal categorization | Tab 2 |
| **Primary Country of Interest** | 53 | Geographic distribution | Tab 1 |
| **Primary Program of Interest** | 52 | Program-level distribution | Tab 1 |
| **CALENDLY Event Created at** | 75 | Bookings before distribution | Tab 1 |
| **Send to Automation** | 54 | Automation workflow tracking | Tab 2 |

## Standard Deal Fields

| Field Name | API Field | Used For | Tab |
|------------|-----------|----------|-----|
| **Deal Owner** | `deal.owner` | Organizing distribution by owner | Tab 1 |
| **Deal ID** | `deal.id` | Fetching custom field data | Both |
| **Deal Title** | `deal.title` | Reference only | Both |
| **Created Date** | `deal.cdate` | Reference only | Both |

---

## Field Value Mappings

### SDR Agent (Field ID: 74)
**Expected Values:**
- `Ana Pascoal`
- `Ruffa Espejon`

**Important:** Values must match exactly (case-sensitive)

---

### Partner (Field ID: 20)
**Expected Values:**
- `AT Legal - Greece`
- `MPC Legal`
- `Rafaela Barbosa - Italy CBD`

**Metrics:**
- AT Legal - Greece → `sentToPartner.atLegalGreece`
- MPC Legal → `sentToPartner.mpcLegalCyprus`
- Rafaela Barbosa - Italy CBD → `sentToPartner.rafaelaBarbosaItalyCBD`

---

### Send to Automation (Field ID: 54)
**Expected Values:**
- `Interest not Identified` → No Interest automation
- `Paid Consultation Portugal D7` → Portugal D7 consultation
- `Paid Consultation Portugal Taxes` → Portugal Tax consultation
- `Paid Consultation Portugal Legal` → Portugal Legal consultation

**Metrics Location:** Tab 2

---

### MQL Lost Reason (Field ID: 55)
**Expected Values:**
- `Service not Available` → Service Not Available
- `Future Opportunities` → Lost - Future Opportunity
- `Unqualified` → Unresponsive / Unqualified
- `Tag to Delete` → Tag to Delete
- `Can't Afford/Ineligible` → Ineligible

**Metrics Location:** Tab 2

---

## Date Fields

### DISTRIBUTION Time (Field ID: 15)
**Format:** ISO 8601 (e.g., `2025-10-10T14:30:00-05:00`)
**Used For:**
- Filtering deals by date (Today/Yesterday)
- All distribution metrics (Tab 1)
- Automation metrics for "Send to Automation" (Tab 2)

### Lost Date Time (Field ID: 89)
**Format:** ISO 8601 (e.g., `2025-10-10T16:45:00-05:00`)
**Used For:**
- Filtering lost deals by date
- All "Lost Reason" metrics (Tab 2)

### CALENDLY Event Created at (Field ID: 75)
**Format:** ISO 8601 (e.g., `2025-10-09T09:15:00-05:00`)
**Used For:**
- Comparing with DISTRIBUTION Time
- Calculating "Bookings Before Distribution" metric

---

## Code Location Reference

### Field IDs are defined in:
**File:** `src/services/api.ts`
**Function:** `fetchAllDealsWithCustomFields`
**Lines:** ~95-105

```typescript
customFields: {
  sdrAgent: fieldValues['74'] || '',           // SDR Agent
  distributionTime: fieldValues['15'] || '',   // DISTRIBUTION Time
  lostDateTime: fieldValues['89'] || '',       // Lost Date Time
  partner: fieldValues['20'] || '',            // Partner
  mqlLostReason: fieldValues['55'] || '',      // MQL Lost Reason
  primaryCountry: fieldValues['53'] || '',     // Primary Country
  primaryProgram: fieldValues['52'] || '',     // Primary Program
  calendlyEventCreated: fieldValues['75'] || '', // CALENDLY Event
  sendToAutomation: fieldValues['54'] || '',   // Send to Automation
}
```

---

## Verification Steps

### How to Verify Field IDs in ActiveCampaign:

1. **Login to ActiveCampaign**
2. **Navigate to:** Settings → Manage Fields → Deals
3. **For each custom field:**
   - Click the field name
   - Check the URL - the ID is at the end
   - Example: `.../dealCustomField/edit/74` → ID is 74

### How to Test Field Values:

1. **Create a test deal** in ActiveCampaign
2. **Set all custom fields** with known values
3. **Use API Explorer** or browser console:
```javascript
// Fetch deal
GET /api/3/deals/{deal_id}

// Fetch custom field data
GET /api/3/deals/{deal_id}/dealCustomFieldData
```
4. **Verify the returned field IDs** match your mapping

---

## Common Issues

### Issue: "No data showing in dashboard"
**Possible Causes:**
- SDR Agent field value doesn't match exactly
- Field IDs are different in your ActiveCampaign account
- Date fields are empty or in wrong format

**Solution:**
1. Check field values match expected values (case-sensitive)
2. Verify field IDs in ActiveCampaign
3. Update field IDs in `src/services/api.ts` if different

### Issue: "Counts are incorrect"
**Possible Causes:**
- Multiple spellings of same value (e.g., "MPC Legal" vs "MPC Legal ")
- Extra whitespace in field values
- Date comparison issues

**Solution:**
1. Use `.trim()` when comparing values (already implemented)
2. Standardize field values in ActiveCampaign
3. Check date formats are ISO 8601

---

## Updating Field IDs

If your ActiveCampaign field IDs are different:

1. **Open:** `src/services/api.ts`
2. **Find:** `fetchAllDealsWithCustomFields` function (line ~95)
3. **Update:** Change the field ID numbers in quotes
4. **Save and commit:**
```bash
git add src/services/api.ts
git commit -m "Update field IDs for ActiveCampaign"
git push
```
5. **Vercel will auto-deploy** the changes

---

## Adding New Fields

To add a new custom field:

1. **Get the field ID** from ActiveCampaign
2. **Update `src/types.ts`:**
```typescript
export interface Deal {
  // ... existing fields
  customFields: {
    // ... existing fields
    newField?: string;  // Add here
  };
}
```

3. **Update `src/services/api.ts`:**
```typescript
customFields: {
  // ... existing fields
  newField: fieldValues['NEW_ID'] || '',  // Add here
}
```

4. **Update metrics calculation** in `src/utils/metricsUtils.ts`
5. **Update UI components** to display the new field
6. **Test thoroughly** before deploying

---

## Field Value Standards

### Best Practices:
1. **Use consistent capitalization**
   - Good: `Ana Pascoal`
   - Bad: `ana pascoal`, `ANA PASCOAL`

2. **Avoid extra spaces**
   - Good: `MPC Legal`
   - Bad: `MPC Legal ` (trailing space)

3. **Use exact matches**
   - The code uses strict equality (`===`)
   - Values must match exactly

4. **Date format**
   - Always use ISO 8601
   - ActiveCampaign provides this automatically

---

## Questions?

If field IDs or values don't match your setup:
1. Review this document
2. Check ActiveCampaign Settings → Manage Fields
3. Use browser dev tools to inspect API responses
4. Update code accordingly
5. Test with sample deals

---

**Last Updated:** October 2025
**Maintained By:** Development Team