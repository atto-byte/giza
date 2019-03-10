import { Constants, Location, Permissions } from 'expo';
import React from 'react';
import { Platform } from 'react-native';
import MapView, { Circle, Polygon, Region } from 'react-native-maps';

interface Rectangle {
  weight: number
}
interface IState {
  region: Region | undefined;
  location: Location.LocationData;
  errorMessage: string | null;
  rectangles: Array<Array<Rectangle | null>>
  itemDeltaLat: number
  itemDeltaLong: number
}
const locations = [

]
const noRows = 25;
const noColumns = 15;
const defaultLatDelta = 0.0922;
const defaultLongDelta = 0.0421;
const getItemNo = (position: number,viewPosition: number, delta: number) => {
  let itemNo = -1;
  const diff = position - viewPosition
  // Is in frame
  if(diff && diff < delta && diff > 0){
    itemNo = Math.floor(diff/delta)
  }
  return itemNo
}

const mapStyles = [
  {
    elementType: 'geometry',
    stylers: [
      {
        color: '#ebe3cd'
      }
    ]
  },
  {
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#523735'
      }
    ]
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#f5f1e6'
      }
    ]
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#c9b2a6'
      }
    ]
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#dcd2be'
      }
    ]
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'off'
      }
    ]
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#ae9e90'
      }
    ]
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [
      {
        color: '#dfd2ae'
      }
    ]
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [
      {
        color: '#dfd2ae'
      }
    ]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text',
    stylers: [
      {
        visibility: 'off'
      }
    ]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#93817c'
      }
    ]
  },
  {
    featureType: 'poi.business',
    stylers: [
      {
        visibility: 'off'
      }
    ]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#a5b076'
      }
    ]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#447530'
      }
    ]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      {
        color: '#f5f1e6'
      }
    ]
  },
  {
    featureType: 'road',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off'
      }
    ]
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [
      {
        color: '#fdfcf8'
      }
    ]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [
      {
        color: '#f8c967'
      }
    ]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#e9bc62'
      }
    ]
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry',
    stylers: [
      {
        color: '#e98d58'
      }
    ]
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#db8555'
      }
    ]
  },
  {
    featureType: 'road.local',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'off'
      }
    ]
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#806b63'
      }
    ]
  },
  {
    featureType: 'transit',
    stylers: [
      {
        visibility: 'off'
      }
    ]
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [
      {
        color: '#dfd2ae'
      }
    ]
  },
  {
    featureType: 'transit.line',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#8f7d77'
      }
    ]
  },
  {
    featureType: 'transit.line',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#ebe3cd'
      }
    ]
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [
      {
        color: '#dfd2ae'
      }
    ]
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#b9d3c2'
      }
    ]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#92998d'
      }
    ]
  }
]
export default class Map extends React.Component<{},IState> {
  state: IState = {
    region: undefined,
    location: {coords: { latitude: 37.78825, longitude: -122.4324, accuracy: 1000}},
    errorMessage: null,
    rectangles: [...Array(noRows)].map(e => Array(noColumns).fill({}))
  }
  handleRegionChange = (region: Region) => {
    const itemDeltaLat = region.latitudeDelta / noRows
    const itemDeltaLong = region.longitudeDelta / noColumns
    this.setState({
      region,
      itemDeltaLat,
      itemDeltaLong
    })
  };

  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }
  }
  
  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Low});
    this.setState({ 
      location,
      region: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: defaultLatDelta,
        longitudeDelta: defaultLongDelta
      }
    });
  };
  
  _addWeightToRectangle = (coords: Location.Coords) => {
    // Get Row No
    const {region } = this.state;
    console.log("Region", region);
    console.log("Location", coords);
    if(region && region.latitude){
      const viewLat = region.latitude;
      const viewLatDelta = region.latitudeDelta || defaultLatDelta
      const viewLong = region.longitude;
      const viewLongDelta = region.longitudeDelta || defaultLongDelta
      if(viewLat && viewLatDelta && viewLong && viewLongDelta){
        let rowNo = getItemNo(coords.longitude, viewLat, viewLongDelta)
        let columnNo = getItemNo(coords.latitude, viewLong,viewLatDelta)
        this.setState(({rectangles}) => {
          rectangles[0][0] = {
            weight: Boolean(rectangles[0][0] && rectangles[0][0].weight) ? rectangles[0][0].weight + 1 : 1
          }
          return({rectangles})
        })
      }
    }
  }
  genRectCoords = (rowNo: number, columnNo: number) => {
    const coords = new Array(4);
    const {region, itemDeltaLong, itemDeltaLat} = this.state;
    const longitude = region.longitude + itemDeltaLong * columnNo;
    const latitude = region.latitude + itemDeltaLat * rowNo
    coords[0] = {
      longitude,
      latitude
    }
    coords[1] = {
      longitude: longitude + itemDeltaLong,
      latitude
    }
    coords[2] = {
      longitude: longitude + itemDeltaLong,
      latitude: latitude + itemDeltaLat
    }
    coords[3] = {
      longitude,
      latitude: latitude + itemDeltaLat
    }
    console.log(coords);
    return coords
  }
  renderRectangles = () => {
    const renderResult: any = this.state.rectangles.reduce((result: any, row, rowNo) => {
      row.map((cell, columnNo) => {
        if(cell && cell.weight){
          result.push(
            <Polygon 
              coordinates={this.genRectCoords(rowNo, columnNo)} 
              fillColor={getColor(cell.weight)}
            />
          )
        }
      })
      return result || []
      
    }, [])
    return renderResult
  }
  render() {
    const {location, region, rectangles} = this.state;
    const initialRegion = (location && location.coords) ? {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421
    } : undefined
    return (
      <MapView
        style={{ flex: 1, height: "100%", width: "100%" }}
        showsUserLocation
        showsMyLocationButton
        customMapStyle={mapStyles}
        initialRegion={initialRegion}
        region={this.state.region}
        onRegionChange={this.handleRegionChange}
        onPress={()=> this._addWeightToRectangle(this.state.location.coords)}
      >
        {this.renderRectangles()}
      </MapView>
    );
  }
}
function getColor(value){
  //value from 0 to 1
  var hue=((1-value)*120).toString(10);
  return ["hsl(",hue,",100%,50%)"].join("");
}
