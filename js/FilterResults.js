
  
  function boundingBox(WKTstring){
    var str=WKTstring;
    var strArray=[];
    var latArray=[];
    var longArray=[];
    var a,b,c,d;
    var wktWindow=new Window();
    str=cutStringFrontUptoChar(str,'('); //cut off beginning of string upto the last '(' 
    //console.log("FilterResults.prototype.filterWKT(): WKT string cut up to the last '(': " + str);
    //remove all the '(' and ')' characters
    for(var i=0;i<str.length;i++){
      if(str[i]=='('||str[i]==')'){
        str=str.substring(0,i)+str.substring(i+1);
        i--;
      }
    }
    //console.log("FilterResults.prototype.filterWKT(): WKT string with all '('s and ')'s removed: " + str);
    strArray=str.split(","); // fill strArray
    //console.log("FilterResults.prototype.filterWKT(): WKT string split at ',': " + JSON.stringify(strArray));
    //cut off spaces at beginning and end of elements of strArray, and split up lat & long into the arrays.
    for(var i=0;i<strArray.length;i++){
      var s=strArray[i];
      //console.log("string before removing spaces:" + s);
      s=removeSpacesAtEnds(s);
      //console.log("spaces front and end removed (returned):" + JSON.stringify(s));
      s=s.split(" "); // type of s changes from string to array
      //console.log("lat and long split: " + JSON.stringify(s));
      if(s.length!=2) console.log("Error in strArray["+i+"]");
      longArray.push(parseFloat(s[0]));
      latArray.push(parseFloat(s[1]));
    }
    if(strArray.length!=latArray.length) console.log("Error in latArray!");
    if(strArray.length!=longArray.length) console.log("Error in longArray!");
    //determine min,max of latArray and longArray
    a = Math.max.apply(null, latArray);
    b = Math.max.apply(null, longArray);
    c = Math.min.apply(null, latArray);
    d = Math.min.apply(null, longArray);
    wktWindow.setCorners(a,b,c,d);
    return wktWindow;
  }
  
  
  function cutStringFrontUptoChar(string,ch){
    for(var i=0;i<string.length;i++){
      if(string[i]==ch&&string[i+1]!=ch){
        string=string.substring(i+1);
        break;
      }
    }
    return string;
  }
  
  function removeSpacesFront(string,ch){
    /*
    for(var i=0;i<string.length;i++){
      if(string[i]==ch&&string[i+1]!=ch){
        string=string.substring(i+1);
        break;
      }
    }
    return string;
    */
    if(string[0] === ch) {
      string = string.substring(1, string.length);
      return removeSpacesFront(string, ch);
    } else {
      //console.log("space at front removed:" + string);
      return string;
    }
  }
  
  function removeSpacesBack(string,ch){
    /*
    for(var i=string.length - 1; i>=0 ;i--){
      if(string[i]==ch&&string[i-1]!=ch){
        string=string.substring(0,i);
        break;
      }
    }
    return string;
    */
    if(string[string.length - 1] === ch) {
      string = string.substring(0, string.length - 1);
      return removeSpacesBack(string, ch);
    } else {
      //console.log("space at back removed:" + string);
      return string;
    }
  }
  
  function removeSpacesAtEnds(string){
    string = removeSpacesFront(removeSpacesBack(string,' '), ' ');
    return string;
  }
  



