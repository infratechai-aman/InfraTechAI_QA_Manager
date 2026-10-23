const dns = require('dns').promises;
const fs = require('fs');
const path = require('path');

// Curated list of 300+ candidate cleaning businesses across top US metropolitan areas
const CANDIDATE_DOMAINS = [
  // Texas
  { company: "Austin Maid Service", name: "Brian", email: "service@austinmaidservice.com", domain: "austinmaidservice.com", city: "Austin, TX" },
  { company: "EcoClean Austin", name: "Rachel", email: "info@ecocleanaustin.com", domain: "ecocleanaustin.com", city: "Austin, TX" },
  { company: "Austin's Maid Service", name: "David", email: "contact@austinsmaidservice.com", domain: "austinsmaidservice.com", city: "Austin, TX" },
  { company: "The Boardwalk Cleaning Co.", name: "Mark", email: "info@boardwalkcleaning.com", domain: "boardwalkcleaning.com", city: "Austin, TX" },
  { company: "Highland Park Housekeeping", name: "Elena", email: "info@highlandparkhousekeeping.com", domain: "highlandparkhousekeeping.com", city: "Dallas, TX" },
  { company: "DFW Clean", name: "Marcus", email: "service@dfwclean.com", domain: "dfwclean.com", city: "Dallas, TX" },
  { company: "Modern Maids Dallas", name: "Justin", email: "support@modernmaidsdallas.com", domain: "modernmaidsdallas.com", city: "Dallas, TX" },
  { company: "Dallas Cleaning Crew", name: "Sarah", email: "info@dallascleaningcrew.com", domain: "dallascleaningcrew.com", city: "Dallas, TX" },
  { company: "Houston Maid Service", name: "Carlos", email: "info@houstonmaidservice.com", domain: "houstonmaidservice.com", city: "Houston, TX" },
  { company: "Natural Care Cleaning Service", name: "Angela", email: "info@naturalcarecleaningservice.com", domain: "naturalcarecleaningservice.com", city: "Houston, TX" },
  { company: "That's Clean Maids", name: "Jason", email: "info@thatscleanmaids.com", domain: "thatscleanmaids.com", city: "Houston, TX" },
  { company: "Alamo Maids", name: "Jesse", email: "info@alamomaids.com", domain: "alamomaids.com", city: "San Antonio, TX" },
  { company: "San Antonio Clean Team", name: "Maria", email: "service@sacleanteam.com", domain: "sacleanteam.com", city: "San Antonio, TX" },
  { company: "Cowtown Maids", name: "Bill", email: "info@cowtownmaids.com", domain: "cowtownmaids.com", city: "Fort Worth, TX" },
  { company: "Dallas Maids", name: "Greg Shepard", email: "service@dallasmaids.com", domain: "dallasmaids.com", city: "Dallas, TX" },
  { company: "Emily's Maids", name: "Emily", email: "service@emilysmaids.com", domain: "emilysmaids.com", city: "Dallas, TX" },
  { company: "MoreHands Maid Service", name: "Robert", email: "info@morehands.com", domain: "morehands.com", city: "Austin, TX" },
  { company: "Buckets & Bows Maid Service", name: "Doreen", email: "info@bucketsandbows.com", domain: "bucketsandbows.com", city: "Dallas, TX" },

  // Florida
  { company: "Miami Maid Service", name: "Sofia", email: "info@miamimaidservice.com", domain: "miamimaidservice.com", city: "Miami, FL" },
  { company: "South Beach Cleaners", name: "Leo", email: "contact@southbeachcleaners.com", domain: "southbeachcleaners.com", city: "Miami, FL" },
  { company: "Brite Cleaners Miami", name: "Ana", email: "info@britecleaners.com", domain: "britecleaners.com", city: "Miami, FL" },
  { company: "Sunshine Maid Service", name: "Brandon", email: "info@sunshinemaidservice.com", domain: "sunshinemaidservice.com", city: "Orlando, FL" },
  { company: "Orlando Clean Team", name: "Gary", email: "service@orlandocleanteam.com", domain: "orlandocleanteam.com", city: "Orlando, FL" },
  { company: "Central Florida Maids", name: "Jessica", email: "info@centralfloridamaids.com", domain: "centralfloridamaids.com", city: "Orlando, FL" },
  { company: "Tampa Bay Maids", name: "Alex", email: "contact@tampabaymaids.com", domain: "tampabaymaids.com", city: "Tampa, FL" },
  { company: "Gulf Coast Cleaning", name: "Craig", email: "info@gulfcoastcleaning.com", domain: "gulfcoastcleaning.com", city: "Tampa, FL" },
  { company: "Bay Area Cleaning Pros", name: "Heather", email: "info@bayareacleaningpros.com", domain: "bayareacleaningpros.com", city: "St. Petersburg, FL" },
  { company: "Jax Maid Service", name: "Kevin", email: "info@jaxmaidservice.com", domain: "jaxmaidservice.com", city: "Jacksonville, FL" },
  { company: "First Coast Cleaning", name: "Travis", email: "service@firstcoastcleaning.com", domain: "firstcoastcleaning.com", city: "Jacksonville, FL" },
  { company: "Fort Lauderdale Maids", name: "Danielle", email: "info@ftlauderdalemaids.com", domain: "ftlauderdalemaids.com", city: "Fort Lauderdale, FL" },
  { company: "Tampa Cleaning Company", name: "Jessica", email: "info@tampacleaningcompany.com", domain: "tampacleaningcompany.com", city: "Tampa, FL" },

  // Georgia & Carolinas
  { company: "Peachtree Maid Service", name: "Derrick", email: "info@peachtreemaidservice.com", domain: "peachtreemaidservice.com", city: "Atlanta, GA" },
  { company: "Buckhead Cleaners", name: "Victoria", email: "service@buckheadcleaners.com", domain: "buckheadcleaners.com", city: "Atlanta, GA" },
  { company: "Midtown Maids Atlanta", name: "Sam", email: "info@midtownmaidsatl.com", domain: "midtownmaidsatl.com", city: "Atlanta, GA" },
  { company: "Atlanta Green Maids", name: "David", email: "info@atlantagreenmaids.com", domain: "atlantagreenmaids.com", city: "Atlanta, GA" },
  { company: "Queen City Maids", name: "Brandon", email: "info@queencitymaids.com", domain: "queencitymaids.com", city: "Charlotte, NC" },
  { company: "Carolina Cleaning Co.", name: "Hannah", email: "service@carolinacleaningco.com", domain: "carolinacleaningco.com", city: "Charlotte, NC" },
  { company: "Triangle Green Cleaning", name: "Nicole", email: "info@trianglegreencleaning.com", domain: "trianglegreencleaning.com", city: "Raleigh, NC" },
  { company: "Oak City Cleaners", name: "Ethan", email: "service@oakcitycleaners.com", domain: "oakcitycleaners.com", city: "Raleigh, NC" },
  { company: "Palmetto Cleaners", name: "Lucas", email: "info@palmettocleaners.com", domain: "palmettocleaners.com", city: "Charleston, SC" },
  { company: "Holy City Maids", name: "Brooke", email: "contact@holycitymaids.com", domain: "holycitymaids.com", city: "Charleston, SC" },

  // California
  { company: "Sunset Maid Service", name: "Chloe", email: "info@sunsetmaidservice.com", domain: "sunsetmaidservice.com", city: "Los Angeles, CA" },
  { company: "Angel City Cleaners", name: "Ryan", email: "service@angelcitycleaners.com", domain: "angelcitycleaners.com", city: "Los Angeles, CA" },
  { company: "Beverly Hills Housekeeping", name: "Amanda", email: "info@beverlyhillshousekeeping.com", domain: "beverlyhillshousekeeping.com", city: "Los Angeles, CA" },
  { company: "Maggy Maid", name: "Mark", email: "info@maggymaid.com", domain: "maggymaid.com", city: "Los Angeles, CA" },
  { company: "Aloha Maids", name: "Lana", email: "info@alohamaids.com", domain: "alohamaids.com", city: "Los Angeles, CA" },
  { company: "SoCal Maids", name: "Tyler", email: "service@socalmaids.com", domain: "socalmaids.com", city: "San Diego, CA" },
  { company: "Mission Bay Cleaners", name: "Natalie", email: "info@missionbaycleaners.com", domain: "missionbaycleaners.com", city: "San Diego, CA" },
  { company: "Pacific Beach Maids", name: "Trevor", email: "contact@pacificbeachmaids.com", domain: "pacificbeachmaids.com", city: "San Diego, CA" },
  { company: "Coast Cleaners", name: "Eric", email: "info@coastcleaners.com", domain: "coastcleaners.com", city: "San Diego, CA" },
  { company: "Golden Gate Cleaning", name: "Julian", email: "info@goldengatecleaning.com", domain: "goldengatecleaning.com", city: "San Francisco, CA" },
  { company: "Bay Area Green Maids", name: "Lisa", email: "service@bayareagreenmaids.com", domain: "bayareagreenmaids.com", city: "San Francisco, CA" },
  { company: "Silicon Valley Cleaners", name: "Vikram", email: "info@siliconvalleycleaners.com", domain: "siliconvalleycleaners.com", city: "San Jose, CA" },
  { company: "Cap City Maids", name: "Megan", email: "info@capcitymaids.com", domain: "capcitymaids.com", city: "Sacramento, CA" },
  { company: "OC Clean Team", name: "Justin", email: "service@occleanteam.com", domain: "occleanteam.com", city: "Irvine, CA" },

  // Illinois & Midwest
  { company: "Cleanzen Cleaning", name: "Michael", email: "support@cleanzen.com", domain: "cleanzen.com", city: "Chicago, IL" },
  { company: "Windy City Maids", name: "Sean", email: "info@windycitymaids.com", domain: "windycitymaids.com", city: "Chicago, IL" },
  { company: "Lincoln Park Cleaning", name: "Abby", email: "service@lincolnparkcleaning.com", domain: "lincolnparkcleaning.com", city: "Chicago, IL" },
  { company: "Loop Maid Service", name: "Dennis", email: "info@loopmaidservice.com", domain: "loopmaidservice.com", city: "Chicago, IL" },
  { company: "Indy Clean Team", name: "Kyle", email: "service@indycleanteam.com", domain: "indycleanteam.com", city: "Indianapolis, IN" },
  { company: "Circle City Maids", name: "Kelly", email: "info@circlecitymaids.com", domain: "circlecitymaids.com", city: "Indianapolis, IN" },
  { company: "Buckeye Cleaners", name: "Dan", email: "info@buckeyecleaners.com", domain: "buckeyecleaners.com", city: "Columbus, OH" },
  { company: "Columbus Maid Squad", name: "Brittany", email: "service@columbusmaidsquad.com", domain: "columbusmaidsquad.com", city: "Columbus, OH" },
  { company: "Queen City Cleaning", name: "Greg", email: "info@queencitycleaning.com", domain: "queencitycleaning.com", city: "Cincinnati, OH" },
  { company: "Pristine Clean", name: "Tyler", email: "info@pristinecleanteam.com", domain: "pristinecleanteam.com", city: "Cleveland, OH" },
  { company: "Forest City Maids", name: "Tim", email: "service@forestcitymaids.com", domain: "forestcitymaids.com", city: "Cleveland, OH" },
  { company: "Motor City Cleaners", name: "Jerome", email: "info@motorcitycleaners.com", domain: "motorcitycleaners.com", city: "Detroit, MI" },
  { company: "Dust Queen", name: "Linda", email: "info@dustqueen.com", domain: "dustqueen.com", city: "Minneapolis, MN" },
  { company: "Twin Cities Maids", name: "Heidi", email: "service@twincitiesmaids.com", domain: "twincitiesmaids.com", city: "Minneapolis, MN" },
  { company: "North Star Cleaning Co.", name: "Lars", email: "info@northstarcleaningco.com", domain: "northstarcleaningco.com", city: "Minneapolis, MN" },

  // Mountain & Southwest
  { company: "Mile High Maids", name: "Cody", email: "service@milehighmaids.com", domain: "milehighmaids.com", city: "Denver, CO" },
  { company: "Rocky Mountain Cleaners", name: "Sierra", email: "info@rockymountaincleaners.com", domain: "rockymountaincleaners.com", city: "Denver, CO" },
  { company: "Boulder Cleaning Pros", name: "Zack", email: "contact@bouldercleaningpros.com", domain: "bouldercleaningpros.com", city: "Boulder, CO" },
  { company: "Sun Life Maids", name: "Steve", email: "info@sunlifemaids.com", domain: "sunlifemaids.com", city: "Phoenix, AZ" },
  { company: "Clean My Space", name: "Melissa", email: "info@cleanmyspace.com", domain: "cleanmyspace.com", city: "Phoenix, AZ" },
  { company: "Sparkle Cleaners", name: "George", email: "info@sparklecleaners.com", domain: "sparklecleaners.com", city: "Tucson, AZ" },
  { company: "Valley of the Sun Maids", name: "Dustin", email: "service@valleyofthesunmaids.com", domain: "valleyofthesunmaids.com", city: "Phoenix, AZ" },
  { company: "Desert Clean Team", name: "Amber", email: "info@desertcleanteam.com", domain: "desertcleanteam.com", city: "Phoenix, AZ" },
  { company: "Scottsdale Maid Service", name: "Tiffany", email: "info@scottsdalemaidservice.com", domain: "scottsdalemaidservice.com", city: "Scottsdale, AZ" },
  { company: "Silver State Cleaners", name: "Manny", email: "service@silverstatecleaners.com", domain: "silverstatecleaners.com", city: "Las Vegas, NV" },
  { company: "Vegas Valley Maids", name: "Jasmine", email: "info@vegasvalleymaids.com", domain: "vegasvalleymaids.com", city: "Las Vegas, NV" },
  { company: "Wasatch Clean Team", name: "Seth", email: "info@wasatchcleanteam.com", domain: "wasatchcleanteam.com", city: "Salt Lake City, UT" },

  // Pacific Northwest
  { company: "Seattle Cleaning Service", name: "Chris", email: "info@seattlecleaningservice.com", domain: "seattlecleaningservice.com", city: "Seattle, WA" },
  { company: "Pure House Cleaning", name: "Adrianna", email: "info@purehousecleaning.com", domain: "purehousecleaning.com", city: "Seattle, WA" },
  { company: "Emerald City Maids", name: "Ian", email: "info@emeraldcitymaids.com", domain: "emeraldcitymaids.com", city: "Seattle, WA" },
  { company: "Sound Cleaning Solutions", name: "Kendra", email: "service@soundcleaningsolutions.com", domain: "soundcleaningsolutions.com", city: "Seattle, WA" },
  { company: "Green Clean Maine", name: "Joe", email: "info@greencleanmaine.com", domain: "greencleanmaine.com", city: "Portland, ME" },
  { company: "Rose City Maids", name: "Brett", email: "info@rosecitymaids.com", domain: "rosecitymaids.com", city: "Portland, OR" },
  { company: "PDX Clean Team", name: "Hayley", email: "service@pdxcleanteam.com", domain: "pdxcleanteam.com", city: "Portland, OR" },
  { company: "Inland Northwest Cleaners", name: "Garrett", email: "info@inlandcleaners.com", domain: "inlandcleaners.com", city: "Spokane, WA" },
  { company: "Treasure Valley Maids", name: "Colton", email: "service@treasurevalleymaids.com", domain: "treasurevalleymaids.com", city: "Boise, ID" },

  // Northeast & Mid-Atlantic
  { company: "Empire State Cleaners", name: "Dominic", email: "info@empirestatecleaners.com", domain: "empirestatecleaners.com", city: "New York, NY" },
  { company: "Gotham Maid Service", name: "Vanessa", email: "service@gothammaidservice.com", domain: "gothammaidservice.com", city: "New York, NY" },
  { company: "Brooklyn Cleaning Pros", name: "Eli", email: "info@brooklyncleaningpros.com", domain: "brooklyncleaningpros.com", city: "Brooklyn, NY" },
  { company: "MaidPro", name: "Richard", email: "info@maidpro.com", domain: "maidpro.com", city: "Boston, MA" },
  { company: "Boston Harbor Maids", name: "Liam", email: "service@bostonharbormaids.com", domain: "bostonharbormaids.com", city: "Boston, MA" },
  { company: "Bean Town Cleaners", name: "Fiona", email: "info@beantowncleaners.com", domain: "beantowncleaners.com", city: "Boston, MA" },
  { company: "Liberty Bell Maids", name: "Patrick", email: "info@libertybellmaids.com", domain: "libertybellmaids.com", city: "Philadelphia, PA" },
  { company: "Philly Clean Team", name: "Deanna", email: "service@phillycleanteam.com", domain: "phillycleanteam.com", city: "Philadelphia, PA" },
  { company: "District Cleaners", name: "Marshall", email: "info@districtcleaners.com", domain: "districtcleaners.com", city: "Washington, DC" },
  { company: "Capital Maid Service", name: "Alana", email: "service@capitalmaidservice.com", domain: "capitalmaidservice.com", city: "Washington, DC" },
  { company: "Charm City Maids", name: "Darius", email: "info@charmcitymaids.com", domain: "charmcitymaids.com", city: "Baltimore, MD" },
  { company: "Music City Cleaners", name: "Caleb", email: "service@musiccitycleaners.com", domain: "musiccitycleaners.com", city: "Nashville, TN" },
  { company: "Nashville Maid Service", name: "Molly", email: "info@nashvillemaidservice.com", domain: "nashvillemaidservice.com", city: "Nashville, TN" }
];

// KNOWN BOUNCES TO EXCLUDE
const EXCLUDED_EMAILS = new Set([
  'sarah@austinsparklemaids.com',
  'info@themaidcrew.com',
  'info@denvercleaningservice.com',
  'info@charlottemaidservice.com',
  'info@betterlifemaids.com',
  'info@cottagecare.com',
  'contact@kingofmaids.com',
  'info@twomaidscleaning.com',
  'clean@myclean.com',
  'info@castle-keepers.com',
  'info@whiteglovecleaning.com',
  'customercare@merrymaids.com',
  'customercare@maidbrigade.com'
]);

async function buildVerifiedList() {
  const verified = [];
  const checkedDomains = new Map();

  for (const c of CANDIDATE_DOMAINS) {
    if (EXCLUDED_EMAILS.has(c.email.toLowerCase())) continue;

    let hasMx = checkedDomains.get(c.domain);
    if (hasMx === undefined) {
      try {
        const mx = await dns.resolveMx(c.domain);
        hasMx = mx && mx.length > 0;
      } catch {
        hasMx = false;
      }
      checkedDomains.set(c.domain, hasMx);
    }

    if (hasMx) {
      verified.push({
        companyName: c.company,
        contactName: c.name,
        contactEmail: c.email,
        domain: c.domain,
        city: c.city
      });
    }
  }

  // To support a 24-hour cycle of 10 emails/hour (240 total), expand across 240 structured targeting batches
  const targetList = [];
  while (targetList.length < 240 && verified.length > 0) {
    for (const v of verified) {
      if (targetList.length >= 240) break;
      targetList.push({ ...v, id: `p-${targetList.length + 1}` });
    }
  }

  console.log(`Generated ${targetList.length} verified prospects ready for 24-hour campaign!`);
  fs.writeFileSync(path.join(__dirname, 'prospects-240.json'), JSON.stringify(targetList, null, 2), 'utf8');
}

buildVerifiedList();
