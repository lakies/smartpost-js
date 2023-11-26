var _____WB$wombat$assign$function_____ = function(name) {return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name)) || self[name]; };
if (!self.__WB_pmw) { self.__WB_pmw = function(obj) { this.__WB_source = obj; return this; } }
{
  let window = _____WB$wombat$assign$function_____("window");
  let self = _____WB$wombat$assign$function_____("self");
  let document = _____WB$wombat$assign$function_____("document");
  let location = _____WB$wombat$assign$function_____("location");
  let top = _____WB$wombat$assign$function_____("top");
  let parent = _____WB$wombat$assign$function_____("parent");
  let frames = _____WB$wombat$assign$function_____("frames");
  let opener = _____WB$wombat$assign$function_____("opener");

var SmartLocation;

if (SmartLocation == undefined) {
	SmartLocation = function (settings) {
		this.init(settings);
	};
}

SmartLocation.URL_PLACES     = 'https://itella.ee/places/places.js';
// SmartLocation.URL_IMG        = 'https://web.archive.org/web/20221005001835/https://www.smartpost.ee/widget/smartpost-logo.jpg';
SmartLocation.URL_IMG        = 'https://cdn.jsdelivr.net/gh/lakies/smartpost-js/smartpost-itella-logo.png';

SmartLocation.ID_CONTAINER   = 'smartpost_cont';
SmartLocation.ID_SELECT      = 'smartpost_select';
SmartLocation.ID_INPUT       = 'smartpost_input';
SmartLocation.ID_CITY        = 'smartpost_city';
SmartLocation.ID_ADDRESS     = 'smartpost_address';
SmartLocation.ID_OPEN        = 'smartpost_open';
SmartLocation.ID_DESCRIPTION = 'smartpost_description';
SmartLocation.NEXT_ID        = 0;

SmartLocation.prototype.init = function (settings) {
  this.curId = "" + (SmartLocation.NEXT_ID++);
  this.settings = settings;
  this.selectedId = this.settings.selected_id || 0;
  this.initSettings();

  var container = document.getElementById(this.settings.target_id);
  if(container) {
    container.innerHTML = this.getWidgetHTML();
    this.fetchData(function(){
  	  this.fillSelect();
  	  this.select.onchange();
    });
  } else {
	throw new Error("SmartPOST widget container `" + this.settings.target_id + "` not found");
  }
  
};

SmartLocation.prototype.initSettings = function () {
	this.ensureDefault = function (settingName, defaultValue) {
    if(!this.settings) {this.settings = new Array();}
		this.settings[settingName] = (this.settings[settingName] == undefined) ? defaultValue : this.settings[settingName];
	};

  this.ensureDefault("target_id",  "smartpost_widget_target");
  this.ensureDefault("placeid_name", "smartpost_terminal_id");
  this.ensureDefault("placename_name", "smartpost_terminal_name");
  this.ensureDefault("default_id",  "-");


  this.ensureDefault("show_infotext",    true);
  this.ensureDefault("show_logo",        true);
  this.ensureDefault("show_city",        true);
  this.ensureDefault("show_address",     true);
  this.ensureDefault("show_opened",      true);
  this.ensureDefault("show_description", false);
  this.ensureDefault("show_default",     false);
// 'Tellimus viiakse kaubanduskeskuses asuvasse iseteeninduslikku pakiautomaati. ' +
//                                          '<br/>Vaata lähemalt: <a href="https://web.archive.org/web/20221005001835/https://uus.smartpost.ee/mis-on-pakiautomaat" target="_blank"> '+
  this.ensureDefault("text_infotext",   'Vaata ka pakiautomaatide asukohtasid <a href="https://web.archive.org/web/20221005001835/https://itella.ee/eraklient/pakiautomaatide-asukohad/" target="_blank"><b>kaardil</b></a>.');

  this.ensureDefault("text_place",       "Pakiautomaadi asukoht:");
  this.ensureDefault("text_address",     "Pakiautomaadi aadress:");
  this.ensureDefault("text_city",        "Pakiautomaadi linn:");
  this.ensureDefault("text_opened",      "Pakiautomaadi lahtiolekuaeg:");
  this.ensureDefault("text_description", "Kirjeldus:");
  this.ensureDefault("text_default_item","- Vali PA -");

  delete this.ensureDefault;
};


SmartLocation.prototype.fetchData = function (callback) {
	
	if(window['places_info'] == undefined){
		
	    var head = document.getElementsByTagName("head").item(0);

	    var id = "smartpostjs";
	    var oScript = document.getElementById(id);
	    if (oScript) head.removeChild(oScript);

	    oScript = document.createElement("SCRIPT");

	    oScript.setAttribute("src", SmartLocation.URL_PLACES);
	    oScript.setAttribute("type", "text/javascript");
	    oScript.setAttribute("id",id);
	    head.appendChild(oScript);
	    
	}
    this.onPlacesAvailable.call(this, callback);
};

SmartLocation.prototype.onPlacesAvailable = function(callback) {
    if (window['places_info'] != undefined) {
        callback.call(this);
    } else {
    	var t = this;
	    setTimeout(function () {
	    	t.onPlacesAvailable.call(t, callback);
	    }, 50);
    }
};

SmartLocation.prototype.fillSelect = function() {
   this.placesMap = new Array();
   
   // Dummy entry
   this.placesMap[this.settings.default_id] = {
	   "place_id":this.settings.default_id,
	   "name":"-",
	   "city":"-",
	   "address":"-",
	   "opened":"-",
	   "description":"-"
   };
   
   this.select = document.getElementById(SmartLocation.ID_SELECT + this.curId);
   var buffer = new Array();

   if(this.settings.show_default){
	   var option = document.createElement('option');
	   option.value=this.settings.default_id;
	   option.appendChild(document.createTextNode(this.settings.text_default_item));
	   this.select.appendChild(option);
   }
   
   for(var i = 0; i < places_info.length; i++) {
     var place      = places_info[i];
     var next_place = null;

     if(i < places_info.length-1) {
       next_place = places_info[i+1];
     }

     if(!next_place || next_place.group_id != place.group_id) {
       var optgroup = document.createElement('optgroup');
       optgroup.label = place.group_name;
       buffer.push(place);

       for(var j = 0; j < buffer.length;j++) {
         var option = document.createElement('option');
         option.appendChild(document.createTextNode(buffer[j].name));
         option.value = buffer[j].place_id;
         optgroup.appendChild(option);
         if(this.selectedId == option.value){
        	 option.selected = true;
         }
       }

       buffer = new Array();
       this.select.appendChild(optgroup);
     } else {
       buffer.push(place);
     }

     this.placesMap[place.place_id] = place;
   }
   this.select.onchange = this.setSelected;
   this.select.smartLocation = this;
};

SmartLocation.prototype.setSelected = function() {

   var place = this.smartLocation.placesMap[this.value];

   document.getElementById(SmartLocation.ID_CITY + this.smartLocation.curId).value = place.city;
   document.getElementById(SmartLocation.ID_ADDRESS + this.smartLocation.curId).value = place.address;
   document.getElementById(SmartLocation.ID_OPEN + this.smartLocation.curId).value = place.opened;
   document.getElementById(SmartLocation.ID_DESCRIPTION + this.smartLocation.curId).value = place.description;
   document.getElementById(SmartLocation.ID_INPUT + this.smartLocation.curId).value = place.name;
};

SmartLocation.prototype.getWidgetHTML = function() {

  return '<div id="'+SmartLocation.ID_CONTAINER + this.curId+'" >'+

      '' + (this.settings.show_infotext ? '<p class="smartpost_info">'+this.settings.text_infotext+'</p>' : '') +''+
      '' + (this.settings.show_logo ? '<img alt="Smartpost logo" src="' + SmartLocation.URL_IMG + '" class="smartpost_left"/>' : '') +''+

      '<div class="smartpost_right">' +
         '<table class="smartpost_table">' +
            '<tr> ' +
              '<td class="smartpost_label">'+this.settings.text_place+'</td>' +
              '<td class="smartpost_input"><select name="'+this.settings.placeid_name+'" id="'+SmartLocation.ID_SELECT + this.curId+'"></select></td>' +
            '</tr>' +

            '<tr '+ (this.settings.show_city ? '' : 'style="display:none;"') +'>' +
              '<td class="smartpost_label">'+this.settings.text_city+'</td>' +
              '<td class="smartpost_input"><input type="text" readonly="readonly" id="'+SmartLocation.ID_CITY + this.curId+'" /></td>' +
            '</tr>' +

            '<tr '+ (this.settings.show_address ? '' : 'style="display:none;"') +'>' +
              '<td class="smartpost_label">'+this.settings.text_address+'</td>' +
              '<td class="smartpost_input"><input type="text" readonly="readonly" id="'+SmartLocation.ID_ADDRESS + this.curId+'"  /></td>' +
            '</tr>' +

            '<tr '+ (this.settings.show_opened ? '' : 'style="display:none;"')+'>' +
              '<td class="smartpost_label">'+this.settings.text_opened+'</td>' +
              '<td class="smartpost_input"><input type="text" readonly="readonly" id="'+SmartLocation.ID_OPEN + this.curId+'" /></td>' +
            '</tr>' +

            '<tr '+(this.settings.show_description ? '' : 'style="display:none;"')+'>' +
              '<td class="smartpost_label">'+this.settings.text_description+'</td>' +
              '<td class="smartpost_input"><input type="text" readonly="readonly" id="'+SmartLocation.ID_DESCRIPTION + this.curId+'" /></td>' +
            '</tr>' +

         '</table>' +

         '<input type="hidden" name="'+this.settings.placename_name+'" id="'+SmartLocation.ID_INPUT + this.curId+'" />' +
       '</div>'+
       '<div style="clear: both"></div>'+
       '</div>';
};


}
