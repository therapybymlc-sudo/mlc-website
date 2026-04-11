import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Image,
  Input,
  Select,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Checkbox,
  SimpleGrid,
  useToast,
} from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiUpload } from "../api";

const COUNTRIES = [
  "Afghanistan","Aland Islands","Albania","Algeria","Andorra","Angola","Anguilla","Antarctica","Antigua and Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia, Plurinational State of","Bonaire, Sint Eustatius and Saba","Bosnia and Herzegovina","Botswana","Bouvet Island","Brazil","British Indian Ocean Territory","Brunei Darussalam","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Central African Republic","Chad","Chile","China","Christmas Island","Cocos (Keeling) Islands","Colombia","Comoros","Congo","Congo, the Democratic Republic of the","Cook Islands","Costa Rica","Cote d’Ivoire","Croatia","Cuba","Curaçao","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Falkland Islands (Malvinas)","Faroe Islands","Fiji","Finland","France","French Guiana","French Polynesia","French Southern Territories","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guadeloupe","Guatemala","Guernsey","Guinea","Guinea-Bissau","Guyana","Haiti","Heard Island and McDonald Islands","Holy See (Vatican City State)","Honduras","Hungary","Iceland","India","Indonesia","Iran, Islamic Republic of","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kiribati","Korea, Democratic People’s Republic of","Korea, Republic of","Kuwait","Kyrgyzstan","Lao People’s Democratic Republic of","Latvia","Lebanon","Lesotho","Liberia","Libyan Arab Jamahiriya","Liechtenstein","Lithuania","Luxembourg","Macao","Macedonia, the former Yugoslav Republic of","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Martinique","Mauritania","Mauritius","Mayotte","Mexico","Moldova, Republic of","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Niue","Norfolk Island","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Pitcairn","Poland","Portugal","Qatar","Reunion","Romania","Russian Federation","Rwanda","Saint Barthélemy","Saint Helena, Ascension and Tristan da Cunha","Saint Kitts and Nevis","Saint Lucia","Saint Martin (French part)","Saint Pierre and Miquelon","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Sint Maarten (Dutch part)","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Georgia and the South Sandwich Islands","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Svalbard and Jan Mayen","Swaziland","Sweden","Switzerland","Syrian Arab Republic","Taiwan","Tajikistan","Tanzania, United Republic of","Thailand","Timor-Leste","Togo","Tokelau","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Turks and Caicos Islands","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","Uruguay","Uzbekistan","Vanuatu","Venezuela, Bolivarian Republic of","Vietnam","Virgin Islands, British","Wallis and Futuna","Western Sahara","Yemen","Zambia","Zimbabwe","Guam","Hong Kong","South Korea"
];

const LANGUAGES = [
  "Abkhaz","Abron","Acholi","Adyghe","Afar","Afrikaans","Akan","Albanian","Amharic","Ancient Greek","Arabic","Aragonese","Aramaic","Armenian","ASL","Aymara","Azerbaijani","Balinese","Bangladeshi","Basque","Bealrusian","Bengali","Berber","Betawi","Bhili","Bihari","Bosnian","Breton","Bulgarian","Burmese","Catalan","Cebuano","Chechen","Cherokee","Chewa","Chickasaw","Chinese (Cantonese)","Chinese (Simplified)","Chinese (Traditional)","Choctaw","Coptic","Cornish","Corsican","Creole","Crimean Tatar","Croatian","Curonian","Czech","Danish","Dawro","Dutch","English","Esperanto","Estonian","Ewe","Farsi","Fijan","Fiji Hindi","Filipino","Finnish","Flemish","French","Frisian","Galician","Georgian","German","Greek","Greenlandic","Gujarati","Haitian Creole","Halbic","Hausa","Hawaiian","Hebrew","Hindi","Hmong","Hungarian","Icelandic","Igbo","Ilongo","Indonesian","Interlingua","Inuktitut","Irish","Italian","Japanese","Javanese","Kabardian","Kalasha","Kannada","Kashmiri","Kashubian","Kazakh","Khandeshi","Khmer","Khowar","Kikuyu","Kinyarwanda","Kirundi","Kituba","Kohistani","Konkani","Korean","Kurdish/Kurdî","Ladin","Langi","Lao","Latgalian","Latin","Latvian","Lingala","Lithuanian","Livonian","Lojban","Lower Sorbian","Low German","Luganda","Luo","Luxembourgish","Macedonian","Malagasy","Malay","Malayalam","Maldivian","Maltese","Mandarin Chinese","Manx","Maori","Marathi","Mauritian Creole","Middle Low German","Min Nan","Mongolian","Mossi","Naandi","Nepali","Norwegian","Occitan","Odia","Ojibwe","Oriya","Oromo","Oshiwambo","Other","Pahari","Pangasinan","Papiamentu","Pashai","Pashto","Patois/Patwa","Persian","Pitjantjatjara","Polish","Portuguese","Proto-Slavic","Prussian","Punjabi","Quechua","Quenya","Rajasthani","Rapa Nui","Romanian","Rotuman","Runyankole","Russian","Sanskrit","Sardinian","Scots","Scottish Gaelic","Sepedi","Serbian","Serbo-Croatian","Sesotho","Setswana","Shina","Shona","Sign Language","Sinhala","Sinhalese","SiSwati","Slovak","Slovenian","Somali","Spanish","Swahili","Swedish","Tagalog","Tajik","Tamil","Tarantino","Telugu","Thai","Tibetan","Tok Pisin","Traditional Chinese (Hong Kong)","Traditional Chinese (Taiwan)","Tulu","Turkish","Twi","Ukrainian","Upper Sorbian","Urdu","Uzbek","Venetian","Vietnamese","Vilamovian","Volapük","Võro","Welsh","Wolof","Xhosa","Yiddish","Yoruba","Zazaki","Zulu"
];

const EXPERIENCE_OPTIONS = ["0-1", "2-4", "5-9", "10-14", "15+"];
const YES_NO = ["Yes", "No"];
const OFFICE_SPACE = [
  "Private office",
  "Shared clinic",
  "Home office",
  "Telehealth only",
  "Other",
];
const YOUNGEST_AGE = ["Under 5", "5-10", "11-13", "14-17", "18+"];
const REFERRAL_SOURCES = [
  "Search",
  "Social media",
  "Referral",
  "Events",
  "Other",
];

const DEFAULT_CONTENT = {
  hero: {
    title: "Therapist Application",
    body:
      "<p>Completing this application will give you access to your own therapist dashboard, where you can streamline your entire practice — from caring for and managing your clients to caring for and supporting yourself as a growing therapist within a connected therapy ecosystem.</p>",
    note:
      "<p>If you align with our values and are eligible to practice in India or internationally, we would love to review your application. Please also reference the “Mental Health Therapist” posting on our careers page.</p>",
  },
  sections: {
    personal: "Personal Info",
    licensure: "Licensure & Practice",
    experience: "Experience & Languages",
    documents: "Documents & Consent",
  },
  form: {
    submit_label: "Submit application",
    required_note: "* required",
    subscribe_label:
      "Subscribe for mental health insights, practice growth tips, resources, and webinar invites.",
    resume_label: "Resume",
    resume_hint: "PDF or DOC/DOCX preferred.",
  },
};

export default function TherapistApply() {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [licensedCountries, setLicensedCountries] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    website: "",
    linkedin: "",
    home_country: "",
    home_city: "",
    home_postal_code: "",
    has_private_practice: "",
    open_to_in_person: "",
    office_space: "",
    in_person_country: "",
    in_person_street: "",
    in_person_city: "",
    in_person_state: "",
    in_person_postal_code: "",
    years_experience: "",
    treat_minors: "",
    youngest_age: "",
    referral_source: "",
    referral_name: "",
    subscribe: false,
  });

  useEffect(() => {
    let isMounted = true;
    const loadContent = async () => {
      try {
        const data = await apiGet("therapist-apply-content/");
        if (!isMounted) return;
        const item = Array.isArray(data) ? data[0] : data;
        if (item && (item.hero || item.sections || item.form)) {
          setContent({
            hero: { ...DEFAULT_CONTENT.hero, ...(item.hero || {}) },
            sections: { ...DEFAULT_CONTENT.sections, ...(item.sections || {}) },
            form: { ...DEFAULT_CONTENT.form, ...(item.form || {}) },
          });
        }
      } catch (error) {
        // Fall back to defaults if content isn't available yet.
      }
    };
    loadContent();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleMulti = (setter) => (e) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    setter(selected);
  };

  const showInPerson = useMemo(
    () => form.open_to_in_person === "Yes",
    [form.open_to_in_person]
  );

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!licensedCountries.length) {
      toast({ title: "Select at least one licensure country.", status: "error" });
      return;
    }
    if (!form.first_name || !form.last_name || !form.email || !form.phone) {
      toast({ title: "Please complete all required fields.", status: "error" });
      return;
    }
    if (!form.home_country || !form.home_city || !form.home_postal_code) {
      toast({ title: "Please complete your home address fields.", status: "error" });
      return;
    }
    if (
      !form.has_private_practice ||
      !form.open_to_in_person ||
      !form.years_experience ||
      !form.treat_minors ||
      !form.youngest_age ||
      !form.referral_source
    ) {
      toast({ title: "Please complete all required selections.", status: "error" });
      return;
    }
    if (!resumeFile) {
      toast({ title: "Please upload your resume.", status: "error" });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          payload.append(key, value);
        }
      });
      payload.append("licensed_countries", JSON.stringify(licensedCountries));
      payload.append("languages", JSON.stringify(languages));
      if (resumeFile) {
        payload.append("resume", resumeFile);
      }
      await apiUpload("therapist-applications/", payload);
      toast({
        title: "Application submitted",
        description: "We received your details and will reach out after review.",
        status: "success",
      });
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        website: "",
        linkedin: "",
        home_country: "",
        home_city: "",
        home_postal_code: "",
        has_private_practice: "",
        open_to_in_person: "",
        office_space: "",
        in_person_country: "",
        in_person_street: "",
        in_person_city: "",
        in_person_state: "",
        in_person_postal_code: "",
        years_experience: "",
        treat_minors: "",
        youngest_age: "",
        referral_source: "",
        referral_name: "",
        subscribe: false,
      });
      setLicensedCountries([]);
      setLanguages([]);
      setResumeFile(null);
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please check your details and try again.",
        status: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box bg="#F9F9F9" py={{ base: 10, md: 16 }}>
      <Helmet>
        <title>Therapist Application | MLC Therapy</title>
        <meta
          name="description"
          content="Apply to join MLC Therapy as a therapist. Submit your details for review and approval."
        />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <VStack spacing={8} maxW="1000px" mx="auto" px={{ base: 5, md: 8 }}>
        <HStack spacing={4} align="center">
          <Image src="/logo_tra.png" alt="MLC Therapy" boxSize="48px" />
          <Heading fontFamily="Playfair Display" size="lg">
            {content.hero?.title || DEFAULT_CONTENT.hero.title}
          </Heading>
        </HStack>
        <Box
          color="gray.600"
          maxW="2xl"
          textAlign="center"
          dangerouslySetInnerHTML={{ __html: content.hero?.body || DEFAULT_CONTENT.hero.body }}
        />
        <Box
          color="gray.600"
          maxW="2xl"
          textAlign="center"
          dangerouslySetInnerHTML={{ __html: content.hero?.note || DEFAULT_CONTENT.hero.note }}
        />

        <Box bg="white" w="100%" borderRadius="3xl" boxShadow="lg" p={{ base: 6, md: 10 }}>
          <form onSubmit={submitApplication}>
            <VStack spacing={8} align="stretch">
              <Box bg="#FBF8F3" p={{ base: 5, md: 6 }} borderRadius="2xl">
                <Heading size="md" mb={4}>
                  {content.sections?.personal || DEFAULT_CONTENT.sections.personal}
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>First Name</FormLabel>
                    <Input value={form.first_name} onChange={handleChange("first_name")} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Last Name</FormLabel>
                    <Input value={form.last_name} onChange={handleChange("last_name")} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input type="email" value={form.email} onChange={handleChange("email")} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Phone</FormLabel>
                    <Input value={form.phone} onChange={handleChange("phone")} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Private Practice Website Link</FormLabel>
                    <Input value={form.website} onChange={handleChange("website")} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>LinkedIn</FormLabel>
                    <Input value={form.linkedin} onChange={handleChange("linkedin")} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Home Address (Country/Territory)</FormLabel>
                    <Select value={form.home_country} onChange={handleChange("home_country")} placeholder="Select">
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Home Address (City)</FormLabel>
                    <Input value={form.home_city} onChange={handleChange("home_city")} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Home Address (ZIP/Postal Code)</FormLabel>
                    <Input value={form.home_postal_code} onChange={handleChange("home_postal_code")} />
                  </FormControl>
                </SimpleGrid>
              </Box>

              <Box bg="#F2F8F5" p={{ base: 5, md: 6 }} borderRadius="2xl">
                <Heading size="md" mb={4}>
                  {content.sections?.licensure || DEFAULT_CONTENT.sections.licensure}
                </Heading>
                <FormControl isRequired>
                  <FormLabel>
                    What country(s) are you currently licensed/registered to practice in?
                  </FormLabel>
                  <Select multiple value={licensedCountries} onChange={handleMulti(setLicensedCountries)} minH="160px">
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                  <FormHelperText>Hold Cmd (Mac) / Ctrl (Windows) to select multiple.</FormHelperText>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                <FormControl isRequired>
                  <FormLabel>Do you have your own private practice?</FormLabel>
                  <Select value={form.has_private_practice} onChange={handleChange("has_private_practice")} placeholder="Select">
                    {YES_NO.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Are you open to seeing patients in‑person?</FormLabel>
                  <Select value={form.open_to_in_person} onChange={handleChange("open_to_in_person")} placeholder="Select">
                    {YES_NO.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>How would you describe your office space?</FormLabel>
                  <Select value={form.office_space} onChange={handleChange("office_space")} placeholder="Select">
                    {OFFICE_SPACE.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>

              {showInPerson && (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                  <FormControl>
                    <FormLabel>In‑person Office Address (Country/Territory)</FormLabel>
                    <Select value={form.in_person_country} onChange={handleChange("in_person_country")} placeholder="Select">
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>In‑person Office Address (Street)</FormLabel>
                    <Input value={form.in_person_street} onChange={handleChange("in_person_street")} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>In‑person Office Address (City)</FormLabel>
                    <Input value={form.in_person_city} onChange={handleChange("in_person_city")} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>In‑person Office Address (State/Province)</FormLabel>
                    <Input value={form.in_person_state} onChange={handleChange("in_person_state")} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>In‑person Office Address (ZIP/Postal Code)</FormLabel>
                    <Input value={form.in_person_postal_code} onChange={handleChange("in_person_postal_code")} />
                  </FormControl>
                </SimpleGrid>
              )}
              </Box>

              <Box bg="#FBF8F3" p={{ base: 5, md: 6 }} borderRadius="2xl">
                <Heading size="md" mb={4}>
                  {content.sections?.experience || DEFAULT_CONTENT.sections.experience}
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>How many years of independently licensed clinical experience do you have?</FormLabel>
                  <Select value={form.years_experience} onChange={handleChange("years_experience")} placeholder="Select">
                    {EXPERIENCE_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Which languages are you fluent in besides English?</FormLabel>
                  <Select multiple value={languages} onChange={handleMulti(setLanguages)} minH="160px">
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </Select>
                  <FormHelperText>Hold Cmd/Ctrl to select multiple.</FormHelperText>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Do you treat minors?</FormLabel>
                  <Select value={form.treat_minors} onChange={handleChange("treat_minors")} placeholder="Select">
                    {YES_NO.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>What is the youngest age open to working with?</FormLabel>
                  <Select value={form.youngest_age} onChange={handleChange("youngest_age")} placeholder="Select">
                    {YOUNGEST_AGE.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>How did you hear about Spring Health?</FormLabel>
                  <Select value={form.referral_source} onChange={handleChange("referral_source")} placeholder="Select">
                    {REFERRAL_SOURCES.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>If referred, who referred you?</FormLabel>
                  <Input value={form.referral_name} onChange={handleChange("referral_name")} />
                </FormControl>
              </SimpleGrid>
              </Box>

              <Box bg="#F2F8F5" p={{ base: 5, md: 6 }} borderRadius="2xl">
                <Heading size="md" mb={4}>
                  {content.sections?.documents || DEFAULT_CONTENT.sections.documents}
                </Heading>
                <FormControl isRequired>
                  <FormLabel>{content.form?.resume_label || DEFAULT_CONTENT.form.resume_label}</FormLabel>
                  <Input
                    type="file"
                    accept="application/pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  />
                  <FormHelperText>
                    {content.form?.resume_hint || DEFAULT_CONTENT.form.resume_hint}
                  </FormHelperText>
                </FormControl>
                <Checkbox mt={4} isChecked={form.subscribe} onChange={handleChange("subscribe")}>
                  {content.form?.subscribe_label || DEFAULT_CONTENT.form.subscribe_label}
                </Checkbox>
              </Box>

              <Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
                {content.form?.submit_label || DEFAULT_CONTENT.form.submit_label}
              </Button>
              <Text fontSize="sm" color="gray.500">
                {content.form?.required_note || DEFAULT_CONTENT.form.required_note}
              </Text>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Box>
  );
}
