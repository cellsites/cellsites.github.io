#!/usr/bin/python
import csv
import math
import zipfile
import os

# Co-ordinate conversion functions are translated from Javascript found at:
# http://www.ibm.com/developerworks/java/library/j-coordconvert

equatorialRadius = 6378137.00
polarRadius = 6356752.314
flattening = 0.00335281066474748
inverseFlattening = 298.257223563
rm = pow(equatorialRadius * polarRadius, 1 / 2.0)

# scale factor
k0 = 0.9996

# eccentricity
e = math.sqrt(1 - pow(polarRadius / equatorialRadius, 2))
e1sq = e * e / (1 - e * e)

n = (equatorialRadius - polarRadius) / (equatorialRadius + polarRadius)

# Meridional Arc
A0 = 6367449.146  # Mean Earth Radius
B0 = 16038.42955
C0 = 16.83261333
D0 = 0.021984404
E0 = 0.000312705
sin1 = 4.84814E-06


def degreeToRadian(degree):
  return degree * math.pi / 180

def getLonZone(longitude):
  longZone = 0
  if (longitude < 0.0):
    longZone = ((180.0 + longitude) / 6) + 1
  else:
    longZone = (longitude / 6) + 31
  val = '%d' % (int(longZone))
  if (len(val) == 1):
    val = "0" + val;
  return val

def getLatZone(latitude):
  posLetters = 'NPQRSTUVWXZ'
  negLetters = 'ACDEFGJKLM'
  posDegrees = [ 0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 84 ]
  negDegrees = [ -90, -84, -72, -64, -56, -48, -40, -32, -24, -16, -8 ]

  latIndex = -2
  lat = int(latitude)
  latZone = ''

  if (lat >= 0):
    i = 0
    letterslen = len(posLetters)
    while i < letterslen:
      if (lat == posDegrees[i]):
        latIndex = i
        break
      if (lat > posDegrees[i]):
        i += 1
        continue
      else:
        latIndex = i - 1
        break
  else:
    i = 0
    letterslen = len(negLetters)
    while (i < letterslen):
      if (lat == negDegrees[i]):
        latIndex = i
        break
      if (lat < negDegrees[i]):
        latIndex = i - 1
        break
      else:
        i += 1
        continue

  if (latIndex == -1):
    latIndex = 0
  if (lat >= 0):
    if (latIndex == -2):
      latIndex = len(posLetters) - 1
    latZone = posLetters[latIndex]
  else:
    if (latIndex == -2):
      latIndex = len(negLetters) - 1
    latZone = negLetters[latIndex]
  return latZone

def getEasting(K4, K5, p):
  return 500000 + (K4 * p + K5 * pow(p, 3))

def getNorthing(latitude, K1, K2, K3, p):
  northing = K1 + K2 * p * p + K3 * pow(p, 4)
  if (latitude < 0.0):
    northing = 100000000 + northing
  return northing

class Digraphs(object):
  digraph1 = {1:'A',2:'B',3:'C',4:'D',5:'E',6:'F',7:'G',8:'H',9:'J',10:'K',11:'L',12:'M',13:'N',14:'P',15:'Q',16:'R',17:'S',18:'T',19:'U',20:'V',21:'W',22:'X',23:'Y',24:'Z'}
  digraph2 = {0:'V',1:'A',2:'B',3:'C',4:'D',5:'E',6:'F',7:'G',8:'H',9:'J',10:'K',11:'L',12:'M',13:'N',14:'P',15:'Q',16:'R',17:'S',18:'T',19:'U',20:'V'}
  digraph1Array = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  digraph2Array = 'VABCDEFGHJKLMNPQRSTUV'

  def getDigraph1(self, longZone, easting):
    a1 = int(longZone)
    a2 = 8 * ((a1 - 1) % 3) + 1

    a3 = easting
    a4 = a2 + (int(a3 / 100000)) - 1
    return self.digraph1[int(math.floor(a4))]

  def getDigraph2(self, longZone, northing):
    a1 = int(longZone)
    a2 = 1 + 5 * ((a1 -1) % 2)

    a3 = northing
    a4 = (a2 + (int(a3 / 100000.0))) % 20
    a4 = math.floor(a4)
    if (a4 < 0):
      a4 = a4 + 19

    return self.digraph2[int(math.floor(a4))]


def calcgridsquares(latnumstr,lonnumstr):
  gridsqure = ''
  latnum = float(latnumstr)
  lonnum = float(lonnumstr)

  latnumrads = degreeToRadian(latnum)
  rho = equatorialRadius * (1 - e * e) / pow(1 - pow(e * math.sin(latnumrads), 2), 3 / 2.0)
  nu = equatorialRadius / pow(1 - pow(e * math.sin(latnumrads), 2), (1 / 2.0))
  var1 = 0.0
  if (lonnum < 0.0):
    var1 = (int((180 + lonnum) / 6.0)) + 1
  else:
    var1 = (int(lonnum / 6)) + 31
  var2 = (6 * var1) - 183
  var3 = (lonnum - var2)
  p = var3 * 3600 / 10000
  S = A0 * latnumrads - B0 * math.sin(2 * latnumrads) + C0 * math.sin(4 * latnumrads) - D0 * math.sin(6 * latnumrads) + E0 * math.sin(8 * latnumrads)
  K1 = S * k0
  K2 = nu * math.sin(latnumrads) * math.cos(latnumrads) * pow(sin1, 2) * k0 * (100000000) / 2
  K3 = ((pow(sin1, 4) * nu * math.sin(latnumrads) * pow(math.cos(latnumrads), 3)) / 24) * (5 - pow(math.tan(latnumrads), 2) + 9 * e1sq * pow(math.cos(latnumrads), 2) + 4 * pow(e1sq, 2) * pow(math.cos(latnumrads), 4)) * k0 * (100000000000000000)
  K4 = nu * math.cos(latnumrads) * sin1 * k0 * 10000
  K5 = pow(sin1 * math.cos(latnumrads), 3) * (nu / 6) * (1 - pow(math.tan(latnumrads), 2) + e1sq * pow(math.cos(latnumrads), 2)) * k0 * 10000000000000
  A6 = (pow(p * sin1, 6) * nu * math.sin(latnumrads) * pow(math.cos(latnumrads), 5) / 720) * (61 - 58 * pow(math.tan(latnumrads), 2) + pow(math.tan(latnumrads), 4) + 270 * e1sq * pow(math.cos(latnumrads), 2) - 330 * e1sq * pow(math.sin(latnumrads), 2)) * k0 * (1E+24)

  if not (-180<=lonnum<180):
    print('invalid longitude found in file - %f' % lonnum)
    gridsquare = 'INVALID'
  else:
    if not (-90<=latnum<90):
      print('invalid latitude found in file - %f' % latnum)
      gridsquare = 'INVALID'
    else:
      lonzone = getLonZone(lonnum)
      latzone = getLatZone(latnum)

      easting = getEasting(K4,K5,p)
      northing = getNorthing(latnum,K1,K2,K3,p)

      digraphs = Digraphs()
      digraph1 = digraphs.getDigraph1(int(lonzone),easting)
      digraph2 = digraphs.getDigraph2(int(lonzone),northing)
      eastingstr = '%d' % (int(easting))
      if (len(eastingstr) < 5):
        eastingstr = '00000' + eastingstr
      eastingstr = eastingstr[-5:-3]
      northingstr = '%d' % (int(northing))
      if (len(northingstr) < 5):
        northingstr = '0000' + northingstr
      northingstr = northingstr[-5:-3]
      gridsquare = '%s%s%s%s%s%s' % (lonzone,latzone,digraph1,digraph2,eastingstr,northingstr)

  return gridsquare

def getsorteddata(datafile,filterword):
  unsorteddata=[]

  with open(datafile, 'rt', encoding='latin-1') as csvfile:
    reader = csv.reader(csvfile, quotechar='"')
    for row in reader:
      if filterword in ' '.join(row).lower():
        liclat = row[13]
        liclon = row[14]
        gridsquare = calcgridsquares(liclat,liclon)
        unsorteddata.append([row[6],row[7],row[11],row[13],row[14],row[25],row[15],row[16],row[21],row[5],row[31],row[32],gridsquare])

  return sorted(unsorteddata, key=lambda x: (x[12],float(x[3]),float(x[4]),float(x[0]),x[1],x[5]))

def genkmlfile(carriername,sorteddata,iconcolor):
  lastlat='_first_'
  lastlon='_first_'
  lastloc=''
  lastmoddate=''
  lastupldate=''
  tabledata=''

  with open(carriername + '_sites.kml', 'w') as kmloutput:
    kmloutput.write('<kml xmlns="http://earth.google.com/kml/2.0">\n')
    kmloutput.write('<Folder>\n')
    for row in sorteddata:
      txfreq = row[0]
      rxfreq = row[1]
      licloc = row[2].replace('&','+')
      liclat = row[3]
      liclon = row[4]
      azimut = row[5]
      elevat = row[6]
      anthgt = row[7]
      emmisi = row[8]
      lictype = row[9] + ' - ' + emmisi
      lastmodified = row[10]
      lastuploaded = row[11]

      pointdist = 305
      if (lastlat != '_first_'):
        lastlatnum = float(lastlat)
        lastlonnum = float(lastlon)
        liclatnum = float(liclat)
        liclonnum = float(liclon)
        lastlatrad = degreeToRadian(lastlatnum)
        liclatrad = degreeToRadian(liclatnum)
        latdiffrad = degreeToRadian(liclatnum - lastlatnum)
        londiffrad = degreeToRadian(liclonnum - lastlonnum)

        a = math.sin(latdiffrad/2) * math.sin(latdiffrad/2) + math.cos(lastlatrad) * math.cos(liclatrad) * math.sin(londiffrad/2) * math.sin(londiffrad/2)
        c = 2 * math.atan2(math.sqrt(a),math.sqrt(1-a))
        pointdist = rm * c

      if (pointdist > 300):
        if (lastlat != '_first_'):
          kmloutput.write(tabledata)
          kmloutput.write('</table>]]>\n')
          kmloutput.write('</description>\n')
          kmloutput.write('</Placemark>\n')
          tabledata=''
        liclatdec=liclat
        liclondec=liclon
        kmloutput.write('<Placemark>\n')
        kmloutput.write('<name>' + licloc[:12] + '</name>\n')
        kmloutput.write('<Style><IconStyle><color>' + iconcolor + '</color><Icon><href>http://maps.google.com/mapfiles/kml/shapes/yen.png</href></Icon></IconStyle></Style>\n')
        kmloutput.write('<Point>\n')
        kmloutput.write('<altitudeMode>absolute</altitudeMode>\n')
        kmloutput.write('<coordinates>' + liclondec + ',' + liclatdec + '</coordinates>\n')
        kmloutput.write('</Point>\n')
        kmloutput.write('<description>\n')
        kmloutput.write('<![CDATA[<b>' + licloc + '(' + elevat + ' + ' + anthgt + ' metres)</b><br/><table width="750"><tr><th><b>TYPE</b></th><th><b>TXFREQ</b></th><th><b>RXFREQ</b></th><th><b>AZIMUTH</b></th><th><b>LAT</b></th><th><b>LON</b></th><th><b>SITE NAME</b></th><th><b>UPDATED</b></th><th><b>UPLOADED</b></th></tr>\n')
        lattoshow = liclatdec
        lontoshow = liclondec
        moddatetoshow = lastmodified
        upldatetoshow = lastuploaded

        lastlat = liclat
        lastlon = liclon
        lastmoddate = lastmodified
        lastupldate = lastuploaded
      else:
        if (liclat == lastlat):
          lattoshow = ''
        else:
          lattoshow = liclatdec
          lastlat = liclat
        if (liclon == lastlon):
          lontoshow = ''
        else:
          lontoshow = liclondec
          lastlon = liclon
        if (lastmodified == lastmoddate):
          moddatetoshow = ''
        else:
          moddatetoshow = lastmodified
          lastmoddate = lastmodified
        if (lastuploaded == lastupldate):
          upldatetoshow = ''
        else:
          upldatetoshow = lastuploaded
          lastupldate = lastuploaded
      if (licloc == lastloc):
        loctoshow = ''
      else:
        loctoshow = licloc
      tabledata += '<tr><td>' + lictype + '</td><td>' + txfreq + '</td><td>' + rxfreq + '</td><td>' + azimut + '</td><td>' + lattoshow + '</td><td>' + lontoshow + '</td><td>' + loctoshow + '</td><td>' + moddatetoshow + '</td><td>' + upldatetoshow + '</td></tr>\n'
      lastloc = licloc
    kmloutput.write('</table>]]>\n')
    kmloutput.write('</description>\n')
    kmloutput.write('</Placemark>\n')
    kmloutput.write('</Folder>\n')
    kmloutput.write('</kml>\n')
    kmloutput.close()

def convertkmltokmz(carriername):
  if (os.path.isfile(carriername + '_sites.kmz')):
    os.remove(carriername + '_sites.kmz')
  with zipfile.ZipFile(carriername + '_sites.kmz', 'w', zipfile.ZIP_DEFLATED) as kmzoutput:
    kmzoutput.write(carriername + '_sites.kml')
    kmzoutput.close()
  if (os.path.isfile(carriername + '_sites.kml')):
    os.remove(carriername + '_sites.kml')
#    print 'Done Writing KMZ File'



def main(argv=None):
  print('Getting SaskTel Data')
  carrierdata=getsorteddata('../Site_Data_Extract.csv','sasktel')
  print('Writing SaskTel KML File')
  genkmlfile('sasktel',carrierdata,'ffff0000')
  print('Converting SaskTel KML to KMZ')
  convertkmltokmz('sasktel')

  print('Getting Bell Data')
  carrierdata=getsorteddata('../Site_Data_Extract.csv','bell ')
  print('Writing Bell KML File')
  genkmlfile('bell',carrierdata,'ff00ff00')
  print('Converting BELL KML to KMZ')
  convertkmltokmz('bell')

  print('Getting Telus Data')
  carrierdata=getsorteddata('../Site_Data_Extract.csv','telus')
  print('Writing Telus KML File')
  genkmlfile('telus',carrierdata,'ff0000ff')
  print('Converting Telus KML to KMZ')
  convertkmltokmz('telus')

main()


