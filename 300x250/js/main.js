/*
*
* mads - version 2.00.01
* Copyright (c) 2015, Ninjoe
* Dual licensed under the MIT or GPL Version 2 licenses.
* https://en.wikipedia.org/wiki/MIT_License
* https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
*
*/
var mads = function(options) {

  var _this = this;

  this.render = options.render;

  /* Body Tag */
  this.bodyTag = document.getElementsByTagName('body')[0];

  /* Head Tag */
  this.headTag = document.getElementsByTagName('head')[0];

  /* json */
  if (typeof json == 'undefined' && typeof rma != 'undefined') {
    this.json = rma.customize.json;
  } else if (typeof json != 'undefined') {
    this.json = json;
  } else {
    this.json = '';
  }

  /* fet */
  if (typeof fet == 'undefined' && typeof rma != 'undefined') {
    this.fet = typeof rma.fet == 'string'
      ? [rma.fet]
      : rma.fet;
  } else if (typeof fet != 'undefined') {
    this.fet = fet;
  } else {
    this.fet = [];
  }

  this.fetTracked = false;

  /* load json for assets */
  this.loadJs(this.json, function() {
    _this.data = json_data;

    _this.render.render();
  });

  /* Get Tracker */
  if (typeof custTracker == 'undefined' && typeof rma != 'undefined') {
    this.custTracker = rma.customize.custTracker;
  } else if (typeof custTracker != 'undefined') {
    this.custTracker = custTracker;
  } else {
    this.custTracker = [];
  }

  /* CT */
  if (typeof ct == 'undefined' && typeof rma != 'undefined') {
    this.ct = rma.ct;
  } else if (typeof ct != 'undefined') {
    this.ct = ct;
  } else {
    this.ct = [];
  }

  /* CTE */
  if (typeof cte == 'undefined' && typeof rma != 'undefined') {
    this.cte = rma.cte;
  } else if (typeof cte != 'undefined') {
    this.cte = cte;
  } else {
    this.cte = [];
  }

  /* tags */
  if (typeof tags == 'undefined' && typeof tags != 'undefined') {
    this.tags = this.tagsProcess(rma.tags);
  } else if (typeof tags != 'undefined') {
    this.tags = this.tagsProcess(tags);
  } else {
    this.tags = '';
  }

  /* Unique ID on each initialise */
  this.id = this.uniqId();

  /* Tracked tracker */
  this.tracked = [];
  /* each engagement type should be track for only once and also the first tracker only */
  this.trackedEngagementType = [];
  /* trackers which should not have engagement type */
  this.engagementTypeExlude = [];
  /* first engagement */
  this.firstEngagementTracked = false;

  /* RMA Widget - Content Area */
  this.contentTag = document.getElementById('rma-widget');

  /* URL Path */
  this.path = typeof rma != 'undefined'
    ? rma.customize.src
    : '';

  /* Solve {2} issues */
  for (var i = 0; i < this.custTracker.length; i++) {
    if (this.custTracker[i].indexOf('{2}') != -1) {
      this.custTracker[i] = this.custTracker[i].replace('{2}', '{{type}}');
    }
  }
};

/* Generate unique ID */
mads.prototype.uniqId = function() {

  return new Date().getTime();
}

mads.prototype.tagsProcess = function(tags) {

  var tagsStr = '';

  for (var obj in tags) {
    if (tags.hasOwnProperty(obj)) {
      tagsStr += '&' + obj + '=' + tags[obj];
    }
  }

  return tagsStr;
}

/* Link Opner */
mads.prototype.linkOpener = function(url) {

  if (typeof url != "undefined" && url != "") {

    if (typeof this.ct != 'undefined' && this.ct != '') {
      url = this.ct + encodeURIComponent(url);
    }

    if (typeof mraid !== 'undefined') {
      mraid.open(url);
    } else {
      window.open(url);
    }

    if (typeof this.cte != 'undefined' && this.cte != '') {
      this.imageTracker(this.cte);
    }
  }
}

/* tracker */
mads.prototype.tracker = function(tt, type, name, value) {

  /*
    * name is used to make sure that particular tracker is tracked for only once
    * there might have the same type in different location, so it will need the name to differentiate them
    */
  name = name || type;

  if (tt == 'E' && !this.fetTracked) {
    for (var i = 0; i < this.fet.length; i++) {
      var t = document.createElement('img');
      t.src = this.fet[i];

      t.style.display = 'none';
      this.bodyTag.appendChild(t);
    }
    this.fetTracked = true;
  }

  if (typeof this.custTracker != 'undefined' && this.custTracker != '' && this.tracked.indexOf(name) == -1) {
    for (var i = 0; i < this.custTracker.length; i++) {
      var img = document.createElement('img');

      if (typeof value == 'undefined') {
        value = '';
      }

      /* Insert Macro */
      var src = this.custTracker[i].replace('{{rmatype}}', type);
      src = src.replace('{{rmavalue}}', value);

      /* Insert TT's macro */
      if (this.trackedEngagementType.indexOf(tt) != '-1' || this.engagementTypeExlude.indexOf(tt) != '-1') {
        src = src.replace('tt={{rmatt}}', '');
      } else {
        src = src.replace('{{rmatt}}', tt);
        this.trackedEngagementType.push(tt);
      }

      /* Append ty for first tracker only */
      if (!this.firstEngagementTracked && tt == 'E') {
        src = src + '&ty=E';
        this.firstEngagementTracked = true;
      }

      /* */
      img.src = src + this.tags + '&' + this.id;

      img.style.display = 'none';
      this.bodyTag.appendChild(img);

      this.tracked.push(name);
    }
  }
};

mads.prototype.imageTracker = function(url) {
  for (var i = 0; i < url.length; i++) {
    var t = document.createElement('img');
    t.src = url[i];

    t.style.display = 'none';
    this.bodyTag.appendChild(t);
  }
}

/* Load JS File */
mads.prototype.loadJs = function(js, callback) {
  var script = document.createElement('script');
  script.src = js;

  if (typeof callback != 'undefined') {
    script.onload = callback;
  }

  this.headTag.appendChild(script);
}

/* Load CSS File */
mads.prototype.loadCss = function(href) {
  var link = document.createElement('link');
  link.href = href;
  link.setAttribute('type', 'text/css');
  link.setAttribute('rel', 'stylesheet');

  this.headTag.appendChild(link);
}

mads.prototype.getParameterByName = function (name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/*
*
* Unit Testing for mads
*
*/
var testunit = function() {

  /* pass in object for render callback */
  this.app = new mads({'render': this});

  document.body.style.padding = 0;
  document.body.style.margin = 0;

  this.render();
}

/*
* render function
* - render has to be done in render function
* - render will be called once json data loaded
*/
testunit.prototype.render = function() {
  var self = this;

  this.app.contentTag.innerHTML = '<div class="container"><img src="' + this.app.path + 'img/300x250.gif" /></div>';

  // window.tracker = 'https://www.cdn.serving1.net/a/analytic.htm?uid=0&isNew=false&referredUrl={{referredUrl}}&rmaId=273&domainId=0&pageLoadId=fa323e79-51f7-a0fd-6e5c-d2cbdfdfdc82&userId=2901&pubUserId=0&campaignId=81e9165deb31bb2e177b18dc0760df55&browser=Chrome&os=others&domain=&callback=trackSuccess&callback=trackSuccess&type={{rmatype}}&tt={{rmatt}}&value={{rmavalue}}'

  var url = decodeURIComponent(window.location.href);
  var querys = {}

  querys.rmaId = this.app.getParameterByName('rmaId', url);
  querys.isNew = this.app.getParameterByName('isNew', url);
  querys.referredUrl = this.app.getParameterByName('referredUrl', url);
  querys.pageLoadId = this.app.getParameterByName('pageLoadId', url);
  querys.userId = this.app.getParameterByName('userId', url);
  querys.campaignId = this.app.getParameterByName('campaignId', url);
  querys.browser = this.app.getParameterByName('browser', url);
  querys.os = this.app.getParameterByName('os', url);
  querys.rmatype = this.app.getParameterByName('type', url);
  querys.domain = this.app.getParameterByName('domain', url);
  querys.sessionId = this.app.id;

  var queryStringA = []

  for (let key in querys) {
    if (querys.hasOwnProperty(key)) {
      queryStringA.push(key + '=' + querys[key])
    }
  }

  this.app.contentTag.querySelector('.container').addEventListener('click', function() {
    self.app.linkOpener('//www.garuda-indonesia.com/id/id/destination/places/tourism-australia.page?' + queryStringA.join('&') + '&' + self.app.tags +'&' + self.app.id);
  });
}

new testunit();
