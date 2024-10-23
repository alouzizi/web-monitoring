from intelxapi import intelx
import sys

query = sys.argv[1]
startdate = sys.argv[2]
enddate = sys.argv[3]

# Initialize intelx service with your API key
service = intelx('')

# Search for the query
results = service.search('contact.ayoub0x1@gmail.com', maxresults=200, datefrom=startdate, dateto=enddate)

print(results)

