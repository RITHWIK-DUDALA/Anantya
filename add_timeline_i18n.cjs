const fs = require('fs');
const path = require('path');

const events = {
  "1": { name: "Inauguration Ceremony", time: "4:00 PM – 4:30 PM", description: "Grand opening with lamp lighting ceremony, welcome address by the Principal, and Vedic invocation." },
  "2": { name: "Rangoli Competition", time: "4:30 PM – 5:30 PM", description: "Teams create stunning rangoli designs inspired by Krishna's life and teachings. Open to all departments." },
  "3": { name: "Dahi Handi", time: "5:30 PM – 6:15 PM", description: "The classic Janmashtami tradition — form human pyramids to break the Dahi Handi! Pure teamwork and fun." },
  "4": { name: "Classical Dance Performance", time: "6:15 PM – 7:00 PM", description: "Graceful Bharatanatyam and folk dance performances depicting stories from the life of Lord Krishna." },
  "5": { name: "Devotional Singing — Bhajan", time: "7:00 PM – 7:45 PM", description: "Soul-stirring bhajan sessions and devotional music performances by students and invited artists." },
  "6": { name: "Fancy Dress – Krishna Theme", time: "7:45 PM – 8:30 PM", description: "Participants dressed as Krishna, Radha, and mythological characters compete on stage. Best costume wins!" },
  "7": { name: "Skit / Drama", time: "8:30 PM – 9:15 PM", description: "Short theatrical performances depicting scenes from Krishna's life — from childhood pranks to Mahabharata wisdom." },
  "8": { name: "Flute Playing Competition", time: "9:15 PM – 10:00 PM", description: "A melodious competition celebrating Lord Krishna's favourite instrument. Judged on skill, expression, and emotion." },
  "9": { name: "Antakshari", time: "10:00 PM – 10:45 PM", description: "The beloved musical game — teams continue songs from the last letter of the previous song. Maximum energy guaranteed!" },
  "10": { name: "Photo Booth", time: "All Evening", description: "A Krishna-themed photo booth with props, costumes, and beautiful backdrops open throughout the entire evening." },
  "11": { name: "Prasadam Distribution", time: "10:45 PM – 11:15 PM", description: "Blessed prasadam, sweets, and refreshments distributed to all participants and attendees with love." },
  "12": { name: "Prize Distribution & Closing", time: "11:15 PM – 11:45 PM", description: "Felicitation of winners from all competitions, certificates of participation, and grand closing ceremony." }
};

const translations = {
  "en": events,
  "hi": {
    "1": { name: "उद्घाटन समारोह", time: "शाम 4:00 – 4:30", description: "दीप प्रज्वलन और वैदिक मंत्रोच्चारण के साथ भव्य उद्घाटन।" },
    "2": { name: "रंगोली प्रतियोगिता", time: "शाम 4:30 – 5:30", description: "कृष्ण के जीवन और शिक्षाओं से प्रेरित सुंदर रंगोली डिजाइन बनाएं।" },
    "3": { name: "दही हांडी", time: "शाम 5:30 – 6:15", description: "दही हांडी फोड़ने के लिए मानव पिरामिड बनाएं! शुद्ध टीम वर्क।" },
    "4": { name: "शास्त्रीय नृत्य प्रदर्शन", time: "शाम 6:15 – 7:00", description: "भगवान कृष्ण के जीवन की कहानियों को दर्शाने वाले भरतनाट्यम और लोक नृत्य।" },
    "5": { name: "भजन गायन", time: "शाम 7:00 – 7:45", description: "छात्रों और आमंत्रित कलाकारों द्वारा भजन और भक्ति संगीत।" },
    "6": { name: "फैंसी ड्रेस", time: "शाम 7:45 – 8:30", description: "कृष्ण, राधा और पौराणिक पात्रों के रूप में तैयार होकर मंच पर आएं।" },
    "7": { name: "नाटक / स्किट", time: "रात 8:30 – 9:15", description: "कृष्ण के जीवन के दृश्यों को दर्शाने वाले संक्षिप्त नाट्य प्रदर्शन।" },
    "8": { name: "बांसुरी वादन प्रतियोगिता", time: "रात 9:15 – 10:00", description: "भगवान कृष्ण के पसंदीदा वाद्य यंत्र का जश्न मनाने वाली प्रतियोगिता।" },
    "9": { name: "अंताक्षरी", time: "रात 10:00 – 10:45", description: "प्रिय संगीत खेल - ऊर्जा और मस्ती से भरपूर!" },
    "10": { name: "फोटो बूथ", time: "पूरी शाम", description: "सुंदर वेशभूषा और पृष्ठभूमि के साथ फोटो बूथ।" },
    "11": { name: "प्रसाद वितरण", time: "रात 10:45 – 11:15", description: "सभी प्रतिभागियों और उपस्थित लोगों को प्रसाद और मिठाई का वितरण।" },
    "12": { name: "पुरस्कार वितरण और समापन", time: "रात 11:15 – 11:45", description: "विजेताओं का सम्मान और भव्य समापन समारोह।" }
  },
  "te": {
    "1": { name: "ప్రారంభోత్సవం", time: "సాయంత్రం 4:00 – 4:30", description: "దీపారాధన మరియు వేద మంత్రాలతో ప్రారంభం." },
    "2": { name: "రంగోలి పోటీ", time: "సాయంత్రం 4:30 – 5:30", description: "కృష్ణుని జీవితం నుండి స్ఫూర్తి పొందిన అందమైన ముగ్గులు వేయండి." },
    "3": { name: "ఉట్టి కొట్టడం", time: "సాయంత్రం 5:30 – 6:15", description: "ఉట్టి కొట్టడానికి మానవ పిరమిడ్లు నిర్మించండి!" },
    "4": { name: "శాస్త్రీయ నృత్య ప్రదర్శన", time: "సాయంత్రం 6:15 – 7:00", description: "కృష్ణుని జీవిత గాథలను వర్ణించే భరతనాట్యం మరియు జానపద నృత్యాలు." },
    "5": { name: "భజన", time: "సాయంత్రం 7:00 – 7:45", description: "విద్యార్థులు మరియు కళాకారులచే భక్తి సంగీతం." },
    "6": { name: "ఫ్యాన్సీ డ్రెస్", time: "రాత్రి 7:45 – 8:30", description: "కృష్ణుడు, రాధ తదితర పౌరాణిక పాత్రల వేషధారణ." },
    "7": { name: "నాటకం / స్కిట్", time: "రాత్రి 8:30 – 9:15", description: "కృష్ణుని జీవితంలోని ఘట్టాలను ప్రదర్శించే నాటకాలు." },
    "8": { name: "వేణుగానం పోటీ", time: "రాత్రి 9:15 – 10:00", description: "కృష్ణుని ఇష్టమైన వాయిద్యంతో సంగీత పోటీ." },
    "9": { name: "అంత్యాక్షరి", time: "రాత్రి 10:00 – 10:45", description: "అందరూ ఇష్టపడే సంగీత క్రీడ!" },
    "10": { name: "ఫోటో బూత్", time: "సాయంత్రం అంతా", description: "కృష్ణుని ఇతివృత్తంతో ఫోటో బూత్." },
    "11": { name: "ప్రసాద వితరణ", time: "రాత్రి 10:45 – 11:15", description: "అందరికీ ప్రసాదం పంపిణీ." },
    "12": { name: "బహుమతి ప్రదానం", time: "రాత్రి 11:15 – 11:45", description: "విజేతలకు బహుమతులు మరియు ముగింపు వేడుక." }
  },
  "ta": {
    "1": { name: "தொடக்க விழா", time: "மாலை 4:00 – 4:30", description: "குத்துவிளக்கு மற்றும் வேத மந்திரங்களுடன் தொடக்கம்." },
    "2": { name: "கோலப் போட்டி", time: "மாலை 4:30 – 5:30", description: "கிருஷ்ணரின் வாழ்க்கையை குறிக்கும் வண்ண கோலங்கள்." },
    "3": { name: "உறியடி", time: "மாலை 5:30 – 6:15", description: "பாரம்பரியமான உறியடி திருவிழா - மனித பிரமிடு!" },
    "4": { name: "பாரம்பரிய நடனம்", time: "மாலை 6:15 – 7:00", description: "கிருஷ்ணரின் லீலைகளை குறிக்கும் பரதநாட்டியம் மற்றும் நாட்டுப்புற நடனங்கள்." },
    "5": { name: "பஜனை", time: "மாலை 7:00 – 7:45", description: "மாணவர்கள் மற்றும் கலைஞர்களின் பக்தி இசை." },
    "6": { name: "மாறுவேடப் போட்டி", time: "இரவு 7:45 – 8:30", description: "கிருஷ்ணர், ராதை மற்றும் புராண கதாபாத்திரங்கள்." },
    "7": { name: "நாடகம்", time: "இரவு 8:30 – 9:15", description: "கிருஷ்ணரின் வாழ்க்கை நிகழ்வுகளை சித்தரிக்கும் நாடகம்." },
    "8": { name: "புல்லாங்குழல் போட்டி", time: "இரவு 9:15 – 10:00", description: "கிருஷ்ணருக்கு பிடித்த வாத்தியமான புல்லாங்குழல் போட்டி." },
    "9": { name: "அந்தாதி", time: "இரவு 10:00 – 10:45", description: "இசை விளையாட்டு - உற்சாகமான அந்தாதி!" },
    "10": { name: "புகைப்பட இடம்", time: "மாலை முழுவதும்", description: "கிருஷ்ணர் கருப்பொருளுடன் புகைப்பட இடம்." },
    "11": { name: "பிரசாதம் வழங்குதல்", time: "இரவு 10:45 – 11:15", description: "அனைவருக்கும் பிரசாதம் வழங்கப்படும்." },
    "12": { name: "பரிசளிப்பு விழா", time: "இரவு 11:15 – 11:45", description: "வெற்றியாளர்களுக்கு பரிசுகள் மற்றும் நிறைவு விழா." }
  },
  "ml": {
    "1": { name: "ഉദ്ഘാടന ചടങ്ങ്", time: "വൈകുന്നേരം 4:00 – 4:30", description: "ദീപം തെളിയിക്കലും പ്രാർത്ഥനയുമായി ആരംഭം." },
    "2": { name: "രംഗോലി മത്സരം", time: "വൈകുന്നേരം 4:30 – 5:30", description: "കൃഷ്ണന്റെ ജീവിതത്തെ അടിസ്ഥാനമാക്കിയുള്ള മനോഹരമായ രംഗോലികൾ." },
    "3": { name: "ഉറിയടി", time: "വൈകുന്നേരം 5:30 – 6:15", description: "ഉറിയടി മത്സരം - മനുഷ്യമതിൽ നിർമ്മിച്ച് ഉറിയടിക്കുക!" },
    "4": { name: "ശാസ്ത്രീയ നൃത്തം", time: "വൈകുന്നേരം 6:15 – 7:00", description: "കൃഷ്ണന്റെ ജീവിത കഥകൾ പറയുന്ന ഭരതനാട്യവും നാടോടി നൃത്തങ്ങളും." },
    "5": { name: "ഭജൻ", time: "വൈകുന്നേരം 7:00 – 7:45", description: "വിദ്യാർത്ഥികളും കലാകാരന്മാരും അവതരിപ്പിക്കുന്ന ഭക്തിഗാനങ്ങൾ." },
    "6": { name: "ഫാൻസി ഡ്രസ്", time: "രാത്രി 7:45 – 8:30", description: "കൃഷ്ണൻ, രാധ തുടങ്ങിയ വേഷങ്ങളിൽ കുട്ടികൾ." },
    "7": { name: "നാടകം", time: "രാത്രി 8:30 – 9:15", description: "കൃഷ്ണന്റെ ജീവിതത്തിലെ സംഭവങ്ങൾ കോർത്തിണക്കിയ നാടകം." },
    "8": { name: "ഓടക്കുഴൽ മത്സരം", time: "രാത്രി 9:15 – 10:00", description: "കൃഷ്ണന് ഏറ്റവും പ്രിയപ്പെട്ട വാദ്യോപകരണമായ ഓടക്കുഴൽ മത്സരം." },
    "9": { name: "അന്താക്ഷരി", time: "രാത്രി 10:00 – 10:45", description: "എല്ലാവർക്കും ഇഷ്ടമുള്ള സംഗീത മത്സരം!" },
    "10": { name: "ഫോട്ടോ ബൂത്ത്", time: "വൈകുന്നേരം മുഴുവൻ", description: "കൃഷ്ണന്റെ തീമിലുള്ള ഫോട്ടോ ബൂത്ത്." },
    "11": { name: "പ്രസാദ വിതരണം", time: "രാത്രി 10:45 – 11:15", description: "എല്ലാവർക്കും പ്രസാദവും മധുരപലഹാരങ്ങളും." },
    "12": { name: "സമ്മാനദാനവും സമാപനവും", time: "രാത്രി 11:15 – 11:45", description: "വിജയികൾക്ക് സമ്മാനങ്ങളും സമാപന ചടങ്ങും." }
  }
};

const dir = path.join(__dirname, 'src', 'i18n', 'translations');

Object.keys(translations).forEach(lang => {
  const filePath = path.join(dir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!data.timeline) data.timeline = {};
    data.timeline.events = translations[lang];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${lang}.json`);
  }
});
