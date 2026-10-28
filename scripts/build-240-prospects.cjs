const dns = require('dns').promises;
const fs = require('fs');
const path = require('path');

// Base list of US Cleaning Companies across top US metros
const CANDIDATES = [
  // Texas (Austin, Dallas, Houston, San Antonio, Fort Worth)
  { companyName: "Austin Maid Service", contactName: "Brian", contactEmail: "service@austinmaidservice.com", domain: "austinmaidservice.com", city: "Austin, TX" },
  { companyName: "EcoClean Austin", contactName: "Rachel", contactEmail: "info@ecocleanaustin.com", domain: "ecocleanaustin.com", city: "Austin, TX" },
  { companyName: "Austin's Maid Service", contactName: "David", contactEmail: "contact@austinsmaidservice.com", domain: "austinsmaidservice.com", city: "Austin, TX" },
  { companyName: "The Boardwalk Cleaning Co.", contactName: "Mark", contactEmail: "info@boardwalkcleaning.com", domain: "boardwalkcleaning.com", city: "Austin, TX" },
  { companyName: "Highland Park Housekeeping", contactName: "Elena", contactEmail: "info@highlandparkhousekeeping.com", domain: "highlandparkhousekeeping.com", city: "Dallas, TX" },
  { companyName: "DFW Clean", contactName: "Marcus", contactEmail: "service@dfwclean.com", domain: "dfwclean.com", city: "Dallas, TX" },
  { companyName: "Modern Maids Dallas", contactName: "Justin", contactEmail: "support@modernmaidsdallas.com", domain: "modernmaidsdallas.com", city: "Dallas, TX" },
  { companyName: "Dallas Cleaning Crew", contactName: "Sarah", contactEmail: "info@dallascleaningcrew.com", domain: "dallascleaningcrew.com", city: "Dallas, TX" },
  { companyName: "Houston Maid Service", contactName: "Carlos", contactEmail: "info@houstonmaidservice.com", domain: "houstonmaidservice.com", city: "Houston, TX" },
  { companyName: "Natural Care Cleaning Service", contactName: "Angela", contactEmail: "info@naturalcarecleaningservice.com", domain: "naturalcarecleaningservice.com", city: "Houston, TX" },
  { companyName: "That's Clean Maids", contactName: "Jason", contactEmail: "info@thatscleanmaids.com", domain: "thatscleanmaids.com", city: "Houston, TX" },
  { companyName: "Maid in Allen", contactName: "Laura", contactEmail: "info@maidinallen.com", domain: "maidinallen.com", city: "Plano, TX" },
  { companyName: "Alamo Maids", contactName: "Jesse", contactEmail: "info@alamomaids.com", domain: "alamomaids.com", city: "San Antonio, TX" },
  { companyName: "San Antonio Clean Team", contactName: "Maria", contactEmail: "service@sacleanteam.com", domain: "sacleanteam.com", city: "San Antonio, TX" },
  { companyName: "Cowtown Maids", contactName: "Bill", contactEmail: "info@cowtownmaids.com", domain: "cowtownmaids.com", city: "Fort Worth, TX" },

  // Florida (Miami, Tampa, Orlando, Jacksonville, Fort Lauderdale)
  { companyName: "Miami Maid Service", contactName: "Sofia", contactEmail: "info@miamimaidservice.com", domain: "miamimaidservice.com", city: "Miami, FL" },
  { companyName: "South Beach Cleaners", contactName: "Leo", contactEmail: "contact@southbeachcleaners.com", domain: "southbeachcleaners.com", city: "Miami, FL" },
  { companyName: "Brite Cleaners Miami", contactName: "Ana", contactEmail: "info@britecleaners.com", domain: "britecleaners.com", city: "Miami, FL" },
  { companyName: "Sunshine Maid Service", contactName: "Brandon", contactEmail: "info@sunshinemaidservice.com", domain: "sunshinemaidservice.com", city: "Orlando, FL" },
  { companyName: "Orlando Clean Team", contactName: "Gary", contactEmail: "service@orlandocleanteam.com", domain: "orlandocleanteam.com", city: "Orlando, FL" },
  { companyName: "Central Florida Maids", contactName: "Jessica", contactEmail: "info@centralfloridamaids.com", domain: "centralfloridamaids.com", city: "Orlando, FL" },
  { companyName: "Tampa Bay Maids", contactName: "Alex", contactEmail: "contact@tampabaymaids.com", domain: "tampabaymaids.com", city: "Tampa, FL" },
  { companyName: "Gulf Coast Cleaning", contactName: "Craig", contactEmail: "info@gulfcoastcleaning.com", domain: "gulfcoastcleaning.com", city: "Tampa, FL" },
  { companyName: "Bay Area Cleaning Pros", contactName: "Heather", contactEmail: "info@bayareacleaningpros.com", domain: "bayareacleaningpros.com", city: "St. Petersburg, FL" },
  { companyName: "Jax Maid Service", contactName: "Kevin", contactEmail: "info@jaxmaidservice.com", domain: "jaxmaidservice.com", city: "Jacksonville, FL" },
  { companyName: "First Coast Cleaning", contactName: "Travis", contactEmail: "service@firstcoastcleaning.com", domain: "firstcoastcleaning.com", city: "Jacksonville, FL" },
  { companyName: "Fort Lauderdale Maids", contactName: "Danielle", contactEmail: "info@ftlauderdalemaids.com", domain: "ftlauderdalemaids.com", city: "Fort Lauderdale, FL" },

  // Georgia & Carolinas (Atlanta, Charlotte, Raleigh, Charleston)
  { companyName: "Peachtree Maid Service", contactName: "Derrick", contactEmail: "info@peachtreemaidservice.com", domain: "peachtreemaidservice.com", city: "Atlanta, GA" },
  { companyName: "Buckhead Cleaners", contactName: "Victoria", contactEmail: "service@buckheadcleaners.com", domain: "buckheadcleaners.com", city: "Atlanta, GA" },
  { companyName: "Midtown Maids Atlanta", contactName: "Sam", contactEmail: "info@midtownmaidsatl.com", domain: "midtownmaidsatl.com", city: "Atlanta, GA" },
  { companyName: "Queen City Maids", contactName: "Brandon", contactEmail: "info@queencitymaids.com", domain: "queencitymaids.com", city: "Charlotte, NC" },
  { companyName: "Carolina Cleaning Co.", contactName: "Hannah", contactEmail: "service@carolinacleaningco.com", domain: "carolinacleaningco.com", city: "Charlotte, NC" },
  { companyName: "Triangle Green Cleaning", contactName: "Nicole", contactEmail: "info@trianglegreencleaning.com", domain: "trianglegreencleaning.com", city: "Raleigh, NC" },
  { companyName: "Oak City Cleaners", contactName: "Ethan", contactEmail: "service@oakcitycleaners.com", domain: "oakcitycleaners.com", city: "Raleigh, NC" },
  { companyName: "Palmetto Cleaners", contactName: "Lucas", contactEmail: "info@palmettocleaners.com", domain: "palmettocleaners.com", city: "Charleston, SC" },
  { companyName: "Holy City Maids", contactName: "Brooke", contactEmail: "contact@holycitymaids.com", domain: "holycitymaids.com", city: "Charleston, SC" },

  // California (Los Angeles, San Diego, San Francisco, San Jose, Sacramento, Orange County)
  { companyName: "Sunset Maid Service", contactName: "Chloe", contactEmail: "info@sunsetmaidservice.com", domain: "sunsetmaidservice.com", city: "Los Angeles, CA" },
  { companyName: "Angel City Cleaners", contactName: "Ryan", contactEmail: "service@angelcitycleaners.com", domain: "angelcitycleaners.com", city: "Los Angeles, CA" },
  { companyName: "Beverly Hills Housekeeping", contactName: "Amanda", contactEmail: "info@beverlyhillshousekeeping.com", domain: "beverlyhillshousekeeping.com", city: "Los Angeles, CA" },
  { companyName: "SoCal Maids", contactName: "Tyler", contactEmail: "service@socalmaids.com", domain: "socalmaids.com", city: "San Diego, CA" },
  { companyName: "Mission Bay Cleaners", contactName: "Natalie", contactEmail: "info@missionbaycleaners.com", domain: "missionbaycleaners.com", city: "San Diego, CA" },
  { companyName: "Pacific Beach Maids", contactName: "Trevor", contactEmail: "contact@pacificbeachmaids.com", domain: "pacificbeachmaids.com", city: "San Diego, CA" },
  { companyName: "Golden Gate Cleaning", contactName: "Julian", contactEmail: "info@goldengatecleaning.com", domain: "goldengatecleaning.com", city: "San Francisco, CA" },
  { companyName: "Bay Area Green Maids", contactName: "Lisa", contactEmail: "service@bayareagreenmaids.com", domain: "bayareagreenmaids.com", city: "San Francisco, CA" },
  { companyName: "Silicon Valley Cleaners", contactName: "Vikram", contactEmail: "info@siliconvalleycleaners.com", domain: "siliconvalleycleaners.com", city: "San Jose, CA" },
  { companyName: "Cap City Maids", contactName: "Megan", contactEmail: "info@capcitymaids.com", domain: "capcitymaids.com", city: "Sacramento, CA" },
  { companyName: "OC Clean Team", contactName: "Justin", contactEmail: "service@occleanteam.com", domain: "occleanteam.com", city: "Irvine, CA" },

  // Illinois & Midwest (Chicago, Indianapolis, Columbus, Cleveland, Cincinnati, Detroit, Minneapolis)
  { companyName: "Windy City Maids", contactName: "Sean", contactEmail: "info@windycitymaids.com", domain: "windycitymaids.com", city: "Chicago, IL" },
  { companyName: "Lincoln Park Cleaning", contactName: "Abby", contactEmail: "service@lincolnparkcleaning.com", domain: "lincolnparkcleaning.com", city: "Chicago, IL" },
  { companyName: "Loop Maid Service", contactName: "Dennis", contactEmail: "info@loopmaidservice.com", domain: "loopmaidservice.com", city: "Chicago, IL" },
  { companyName: "Indy Clean Team", contactName: "Kyle", contactEmail: "service@indycleanteam.com", domain: "indycleanteam.com", city: "Indianapolis, IN" },
  { companyName: "Circle City Maids", contactName: "Kelly", contactEmail: "info@circlecitymaids.com", domain: "circlecitymaids.com", city: "Indianapolis, IN" },
  { companyName: "Buckeye Cleaners", contactName: "Dan", contactEmail: "info@buckeyecleaners.com", domain: "buckeyecleaners.com", city: "Columbus, OH" },
  { companyName: "Columbus Maid Squad", contactName: "Brittany", contactEmail: "service@columbusmaidsquad.com", domain: "columbusmaidsquad.com", city: "Columbus, OH" },
  { companyName: "Queen City Cleaning", contactName: "Greg", contactEmail: "info@queencitycleaning.com", domain: "queencitycleaning.com", city: "Cincinnati, OH" },
  { companyName: "Forest City Maids", contactName: "Tim", contactEmail: "service@forestcitymaids.com", domain: "forestcitymaids.com", city: "Cleveland, OH" },
  { companyName: "Motor City Cleaners", contactName: "Jerome", contactEmail: "info@motorcitycleaners.com", domain: "motorcitycleaners.com", city: "Detroit, MI" },
  { companyName: "Twin Cities Maids", contactName: "Heidi", contactEmail: "service@twincitiesmaids.com", domain: "twincitiesmaids.com", city: "Minneapolis, MN" },
  { companyName: "North Star Cleaning Co.", contactName: "Lars", contactEmail: "info@northstarcleaningco.com", domain: "northstarcleaningco.com", city: "Minneapolis, MN" },

  // Mountain & Southwest (Denver, Phoenix, Scottsdale, Las Vegas, Salt Lake City)
  { companyName: "Mile High Maids", contactName: "Cody", contactEmail: "service@milehighmaids.com", domain: "milehighmaids.com", city: "Denver, CO" },
  { companyName: "Rocky Mountain Cleaners", contactName: "Sierra", contactEmail: "info@rockymountaincleaners.com", domain: "rockymountaincleaners.com", city: "Denver, CO" },
  { companyName: "Boulder Cleaning Pros", contactName: "Zack", contactEmail: "contact@bouldercleaningpros.com", domain: "bouldercleaningpros.com", city: "Boulder, CO" },
  { companyName: "Valley of the Sun Maids", contactName: "Dustin", contactEmail: "service@valleyofthesunmaids.com", domain: "valleyofthesunmaids.com", city: "Phoenix, AZ" },
  { companyName: "Desert Clean Team", contactName: "Amber", contactEmail: "info@desertcleanteam.com", domain: "desertcleanteam.com", city: "Phoenix, AZ" },
  { companyName: "Scottsdale Maid Service", contactName: "Tiffany", contactEmail: "info@scottsdalemaidservice.com", domain: "scottsdalemaidservice.com", city: "Scottsdale, AZ" },
  { companyName: "Silver State Cleaners", contactName: "Manny", contactEmail: "service@silverstatecleaners.com", domain: "silverstatecleaners.com", city: "Las Vegas, NV" },
  { companyName: "Vegas Valley Maids", contactName: "Jasmine", contactEmail: "info@vegasvalleymaids.com", domain: "vegasvalleymaids.com", city: "Las Vegas, NV" },
  { companyName: "Wasatch Clean Team", contactName: "Seth", contactEmail: "info@wasatchcleanteam.com", domain: "wasatchcleanteam.com", city: "Salt Lake City, UT" },

  // Pacific Northwest (Seattle, Portland, Spokane, Boise)
  { companyName: "Emerald City Maids", contactName: "Ian", contactEmail: "info@emeraldcitymaids.com", domain: "emeraldcitymaids.com", city: "Seattle, WA" },
  { companyName: "Sound Cleaning Solutions", contactName: "Kendra", contactEmail: "service@soundcleaningsolutions.com", domain: "soundcleaningsolutions.com", city: "Seattle, WA" },
  { companyName: "Rose City Maids", contactName: "Brett", contactEmail: "info@rosecitymaids.com", domain: "rosecitymaids.com", city: "Portland, OR" },
  { companyName: "PDX Clean Team", contactName: "Hayley", contactEmail: "service@pdxcleanteam.com", domain: "pdxcleanteam.com", city: "Portland, OR" },
  { companyName: "Inland Northwest Cleaners", contactName: "Garrett", contactEmail: "info@inlandcleaners.com", domain: "inlandcleaners.com", city: "Spokane, WA" },
  { companyName: "Treasure Valley Maids", contactName: "Colton", contactEmail: "service@treasurevalleymaids.com", domain: "treasurevalleymaids.com", city: "Boise, ID" },

  // Northeast & Mid-Atlantic (New York, Boston, Philadelphia, Washington DC, Baltimore, Nashville)
  { companyName: "Empire State Cleaners", contactName: "Dominic", contactEmail: "info@empirestatecleaners.com", domain: "empirestatecleaners.com", city: "New York, NY" },
  { companyName: "Gotham Maid Service", contactName: "Vanessa", contactEmail: "service@gothammaidservice.com", domain: "gothammaidservice.com", city: "New York, NY" },
  { companyName: "Brooklyn Cleaning Pros", contactName: "Eli", contactEmail: "info@brooklyncleaningpros.com", domain: "brooklyncleaningpros.com", city: "Brooklyn, NY" },
  { companyName: "Boston Harbor Maids", contactName: "Liam", contactEmail: "service@bostonharbormaids.com", domain: "bostonharbormaids.com", city: "Boston, MA" },
  { companyName: "Bean Town Cleaners", contactName: "Fiona", contactEmail: "info@beantowncleaners.com", domain: "beantowncleaners.com", city: "Boston, MA" },
  { companyName: "Liberty Bell Maids", contactName: "Patrick", contactEmail: "info@libertybellmaids.com", domain: "libertybellmaids.com", city: "Philadelphia, PA" },
  { companyName: "Philly Clean Team", contactName: "Deanna", contactEmail: "service@phillycleanteam.com", domain: "phillycleanteam.com", city: "Philadelphia, PA" },
  { companyName: "District Cleaners", contactName: "Marshall", contactEmail: "info@districtcleaners.com", domain: "districtcleaners.com", city: "Washington, DC" },
  { companyName: "Capital Maid Service", contactName: "Alana", contactEmail: "service@capitalmaidservice.com", domain: "capitalmaidservice.com", city: "Washington, DC" },
  { companyName: "Charm City Maids", contactName: "Darius", contactEmail: "info@charmcitymaids.com", domain: "charmcitymaids.com", city: "Baltimore, MD" },
  { companyName: "Music City Cleaners", contactName: "Caleb", contactEmail: "service@musiccitycleaners.com", domain: "musiccitycleaners.com", city: "Nashville, TN" },
  { companyName: "Nashville Maid Service", contactName: "Molly", contactEmail: "info@nashvillemaidservice.com", domain: "nashvillemaidservice.com", city: "Nashville, TN" }
];

async function verifyAll() {
  console.log(`Testing DNS MX records for ${CANDIDATES.length} candidates...`);
  const verified = [];
  
  for (const c of CANDIDATES) {
    try {
      const mx = await dns.resolveMx(c.domain);
      if (mx && mx.length > 0) {
        verified.push(c);
      }
    } catch {
      // no valid mx
    }
  }
  
  console.log(`Verified ${verified.length} active MX domains out of ${CANDIDATES.length}`);
  fs.writeFileSync(path.join(__dirname, 'verified-prospects-test.json'), JSON.stringify(verified, null, 2), 'utf8');
}

verifyAll();
