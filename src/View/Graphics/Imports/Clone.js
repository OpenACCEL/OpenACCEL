function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null === obj || "object" !== typeof obj) return obj;

    var copy;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var i;
        copy = [];
        for (i in obj) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}
//------------------------------------------------------------
function fastClone(obj){
   //if(obj==undefined){
   // alert('try to clone the void');
   //}
   var copy;
   if(!(obj instanceof Array))return obj;   
   // Handle Array
   if (obj instanceof Array) {
       copy = [];
		for (var i in obj) {
            copy[i] = fastClone(obj[i]);
		}
        return copy;
   }

   // Handle Object
   if (obj instanceof Object) {
       copy = {};
       for (var attr in obj) {
           if (obj.hasOwnProperty(attr)) copy[attr] = fastClone(obj[attr]);
       }
       return copy;
   }
	
	// Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }
	
	// Handle the 3 simple types, and null or undefined
   
    if (null === obj || "object" !== typeof obj) return obj;


    throw new Error("Unable to copy obj! Its type isn't supported.");
}
//----------------------------------------------
function deepCompare(ob1,ob2){
  if(typeof(ob1)!=typeof(ob2)){
    return false;
  }
  if(typeof(ob1)!='object'){
    return (ob1==ob2);
  }
  var equal=true;
  var key;
  if(ob1 instanceof Array){
    for(key in ob1){
      if(ob2[key]!==undefined){
        equal=equal && deepCompare(ob1[key],ob2[key]);
      } else {
        equal=false;
      }
    }
    for(key in ob2){
      if(ob1[key]!==undefined){
        equal=equal && deepCompare(ob1[key],ob2[key]);
      } else {
        equal=false;
      }
    }
    return equal;
  }
  for(key in ob1){
      if(ob2.hasOwnProperty(key)){
        equal=equal && deepCompare(ob1[key],ob2[key]);
      } else {
        equal=false;
      }
  }
  for(key in ob2){
      if(ob1.hasOwnProperty(key)){
        equal=equal && deepCompare(ob1[key],ob2[key]);
      } else {
        equal=false;
      }
  }
  return equal;
}