import { currentCurrency } from "./currency_type";
const lang_Type = {
  en: "English",
  de: "German",
};

/**
 * @typedef {typeof translations['en']} TranslationKeys
 */

const translations = {
  en: {
    login: "Login",
    guest_login: "Guest Login",
    register: "Register",
    login_or_register: "Login or Register",
    logout: "Logout",

    search_anything: "Search Anything",

    green_login: "Green Login",
    your_email: "Your Email",
    your_name: "Your Name",
    your_phone: "Your Phone Number",
    password: "Password",
    customer_name: "Customer Name",

    forgotPassword: "Forgot Password?",
    submit: "Submit",

    dont_have_account: "Don't have an account yet?",
    register_here: "Register Here",

    already_have_account: "Already have an account?",
    login_here: "Login here",

    click_here: "Click Here",

    postCode: "Postcode",
    change_postcode: "Change Postcode",

    off_delivery: "OFF Delivery",
    delivery: "Delivery",

    off_pickup: "OFF Pickup",
    pickup: "Pickup",

    cash: "Cash",
    cash_on_delivery: "Cash on Delivery",
    online_payment: "Online Payment",

    select_your: "Select your",
    address: "Address",
    apartment: "Apartment / House number",
    city: "City",
    country: "Country",

    delivery_fee: "Delivery Fee",

    items: "Items",
    item: "Item",
    qty: "Qty",
    price: "Price",

    edit: "Edit",
    update: "Update",

    your_cart_is_empty: "Your cart is empty",

    total: "Total",
    subtotal: "Subtotal",
    discount: "Discount",

    save: "Save",
    saved: "Saved",
    save_changes: "Save Changes",

    delivery_charges: "Delivery Charges",
    grand_total: "Grand Total",

    items_added: "Items added",

    add: "Add",
    added: "Added",

    add_note: "Add Note",
    edit_note: "Edit Note",

    discount_management: "Discount Management",
    set_discount_percentages: "Set Discount Percentages",
    delivery_discount_percentage: "Delivery Discount Percentage (%)",
    pickup_discount_percentage: "Pickup Discount Percentage (%)",
    expiry_date: "Expiry Date",

    saving: "Saving...",
    processing: "Processing",
    updating: "Updating",

    continue: "Continue",
    sending: "Sending",

    message: "Message",

    save_discounts: "Save Discounts",
    current_discounts: "Current Discounts",
    loading_discounts: "Loading discounts...",

    type: "Type",
    value: "Value",

    loading: "Loading",
    view_cart: "View Cart",

    order_processing: "Your order",
    is_being_processed: "is being processed...",

    order_accepted: "Your Order has been Accepted",
    thanks_order: "Thanks for your order!",

    order_id: "Order ID",

    back_to: "Back to",
    home: "Home",

    order_not_accepted: "Order Not Accepted",
    order_rejected_message: "Sorry, the restaurant couldn't accept your order",

    waiting_confirmation: "Waiting for Restaurant Confirmation",

    no_categories_available: "No categories available",
    no_products_found: "No products found in any category",

    select_payment_method: "Select Payment Method",

    update_your_info: "Update Your Info",
    enter_your_details: "Enter Your Details",
    enter_shipping_address: "Enter Your Shipping Address",
    edit_address_details: "Edit Address Details",

    contact_thank_you_heading: "Thank you for contacting us!",
    contact_thank_you_message:
      "Your message has been successfully sent. We will get back to you soon.",

    contact_us_heading: "Contact Us",
    contact_us_message:
      "Have questions? Fill out the form below and we'll get back to you as soon as possible.",

    reset_password_heading: "Reset Password",
    new_password_label: "New Password",
    confirm_password_label: "Confirm Password",

    pay_now: "Pay Now",
    place_order: "Place Order",

    closed_for_today: "Closed for today",
    opens_at: "Opens at",

    cancel: "Cancel",
    note: "Note",

    form_fill_message: "Please fill out all the fields",

    payment_completed_message: "Payment completed successfully!",
    transaction_id: "Transaction ID",

    online_payment_instructions:
      "Click the PayPal button above to complete your payment. Your order will be placed automatically after successful payment.",

    cash_payment_instructions: "You will pay in cash upon delivery/pickup.",

    paypal_insufficient_funds:
      "You don't have enough balance in your PayPal account to complete this payment.",

    paypal_capture_status: "Payment capture status:",
    paypal_not_completed: "Payment was not completed successfully.",
    paypal_failed: "Payment failed. Please try again.",
    paypal_error: "An error occurred during payment. Please try again.",
    paypal_cancelled: "Payment was cancelled.",
    paypal_complete_first: "Please complete the PayPal payment first.",
    paypal_declined: "Your payment method was declined. Please try another.",
    paypal_card_expired:
      "Your card has expired. Please use a different payment method.",
    paypal_pending: "Your payment is pending. Please wait for confirmation.",

    currency_symbol: "$",
    currency_code: "USD",

    immediately: "Immediately",
    pre_order: "Pre-order",
    available_times: "Available Times",
    select_valid_time: "Please select a valid time.",
  },

  de: {
    login: "Anmeldung",
    guest_login: "Gast-Login",
    register: "Registrieren",
    login_or_register: "Anmelden oder Registrieren",
    logout: "Ausloggen",

    search_anything: "Alles Suchen",

    green_login: "Einloggen",
    your_email: "Ihre E-Mail",
    your_name: "Ihr Name",
    your_phone: "Ihre Telefonnummer",
    password: "Kennwort",
    customer_name: "Name",

    forgotPassword: "Passwort vergessen?",
    submit: "Einreichen",

    dont_have_account: "Sie haben noch kein Konto?",
    register_here: "Hier registrieren",

    already_have_account: "Hast du bereits ein Konto?",
    login_here: "Hier anmelden",

    click_here: "Hier klicken",

    postCode: "Postleitzahl",
    change_postcode: "Postleitzahl ändern",

    off_delivery: "OFF-Lieferung",
    delivery: "Lieferung",

    off_pickup: "OFF-Abholung",
    pickup: "Abholung",

    cash: "Bar",
    cash_on_delivery: "Bargeld",
    online_payment: "Online-Zahlung",

    select_your: "Wählen Sie Ihre",
    address: "Adresse",
    apartment: "Straße und Hausnummer",
    city: "Ort",
    country: "Land",

    delivery_fee: "Liefergebühr",

    items: "Artikel",
    item: "Artikel",
    qty: "Menge",
    price: "Preis",

    edit: "Bearbeiten",
    update: "Aktualisieren",

    your_cart_is_empty: "Ihr Warenkorb ist leer",

    total: "Gesamt",
    subtotal: "Zwischensumme",
    discount: "Rabatt",

    save: "Speichern",
    saved: "Gespart",
    save_changes: "Änderungen speichern",

    delivery_charges: "Liefergebühren",
    grand_total: "Gesamtsumme",

    items_added: "Artikel hinzugefügt",

    add: "Hinzufügen",
    added: "Hinzugefügt",

    add_note: "Notiz hinzufügen",
    edit_note: "Notiz bearbeiten",

    discount_management: "Rabattverwaltung",
    set_discount_percentages: "Rabattprozentsätze festlegen",
    delivery_discount_percentage: "Lieferungsrabatt (%)",
    pickup_discount_percentage: "Abholungsrabatt (%)",
    expiry_date: "Ablaufdatum",

    saving: "Speichert...",
    processing: "Verarbeitung",
    updating: "Aktualisierung",

    continue: "Weitermachen",
    sending: "Senden",

    message: "Nachricht",

    save_discounts: "Rabatte speichern",
    current_discounts: "Aktuelle Rabatte",
    loading_discounts: "Lade Rabatte...",

    type: "Typ",
    value: "Wert",

    loading: "Lade",
    view_cart: "Warenkorb ansehen",

    order_processing: "Ihre Bestellung",
    is_being_processed: "wird bearbeitet...",

    order_accepted: "Ihre Bestellung wurde angenommen",
    thanks_order: "Danke für Ihre Bestellung!",

    order_id: "Bestellnummer",

    back_to: "Zurück zu",
    home: "Startseite",

    order_not_accepted: "Bestellung nicht angenommen",
    order_rejected_message:
      "Leider konnte das Restaurant Ihre Bestellung nicht annehmen",

    waiting_confirmation: "Warten auf Bestätigung durch das Restaurant",

    no_categories_available: "Keine Kategorien verfügbar",
    no_products_found: "Keine Produkte gefunden",

    select_payment_method: "Zahlungsmethode auswählen",

    update_your_info: "Daten aktualisieren",
    enter_your_details: "Daten eingeben",
    enter_shipping_address: "Lieferadresse eingeben",
    edit_address_details: "Adresse bearbeiten",

    contact_thank_you_heading: "Vielen Dank für Ihre Kontaktaufnahme!",
    contact_thank_you_message:
      "Ihre Nachricht wurde erfolgreich gesendet. Wir melden uns bald.",

    contact_us_heading: "Kontaktieren Sie uns",
    contact_us_message: "Haben Sie Fragen? Füllen Sie das Formular aus.",

    reset_password_heading: "Passwort zurücksetzen",
    new_password_label: "Neues Passwort",
    confirm_password_label: "Passwort bestätigen",

    pay_now: "Jetzt bezahlen",
    place_order: "Bestellen",

    closed_for_today: "Heute geschlossen",
    opens_at: "Öffnet um",

    cancel: "Abbrechen",
    note: "Notiz",

    form_fill_message: "Bitte alle Felder ausfüllen",

    payment_completed_message: "Zahlung erfolgreich!",
    transaction_id: "Transaktions-ID",

    currency_symbol: "€",
    currency_code: "EUR",

    immediately: "Sofort",
    pre_order: "Vorbestellung",
    available_times: "Verfügbare Zeiten",
    select_valid_time: "Bitte gültige Zeit wählen.",
  },
};
