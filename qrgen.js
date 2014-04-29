var qrgen = {
    url: '',
    type: 1,
    targetUrl: '',
    width: 10,
    getQrCode: function(url, onReady) {
        this.type = $('input[name=download_type]:checked').val();
        this.targetUrl = url;
        this.url = 'http://touchdata.net/externs/chrome/qrcode/index.php?url=' + encodeURIComponent(this.targetUrl) + '&type=' + this.type + '&width=' + (this.width);
        this.loadImage(onReady);
    },
    loadImage: function(onReady) {
        var img = $("<img />").attr('src', this.url)
                .load(function() {
                    if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
                        alert('broken image!');
                    } else {
                        $('#qrcodeimage').fadeIn();
                        $('#qrcodeimage').html(img);
                        $('body').css('width', '304px');
                        if (onReady) {
                            onReady();
                        }
                    }
                });
    },
    fromTab: function(onReady) {
        chrome.tabs.getSelected(null, function(tab) {
            qrgen.getQrCode(tab.url, onReady);
        });
    },
    fromString: function(url, onReady) {
        qrgen.getQrCode(url, onReady);
    },
    downloadFile: function() {
        qrgen.getQrCode(qrgen.targetUrl, function() {
            var filename = 'qrcode.' + (qrgen.type == 1 ? 'svg' : 'png');
            chrome.downloads.download({url: qrgen.url, filename: filename}, function(downloadId) {
                if (!downloadId) {
                    alert('something went wrong!');
                }
            });
        });
    }
};

function initButtons() {
    $('#download_buttons').show();
    if (qrgen.type == 0) {
        initPng();
    } else {
        $('#width_preview').html('Size: ' + qrgen.width);
        $('#png_width').hide();
        $('#width_preview').hide();
    }
}

function initPng() {
    $('#png_width').show();
    $('#width_preview').show();
    $('#slider-range-max').slider({
        range: 'max',
        min: 1,
        max: 10,
        value: qrgen.width,
        step: 1,
        slide: function(event, ui) {
            qrgen.width = ui.value;
            $('#width_preview').html('Size: ' + qrgen.width);
            qrgen.getQrCode(qrgen.targetUrl);

        }
    });
}

$(document).ready(function() {
    $('input[name=download_type]').change(function() {
        window.console.log("change event");
        qrgen.getQrCode(qrgen.targetUrl, function() {
            if (qrgen.type == 0) {
                initPng();
            } else {
                $('#png_width').hide();
                $('#width_preview').hide();
            }
        });
    });

    $('#current').unbind('click touchstart').bind('click touchstart', function(ev) {
        ev.preventDefault();
        qrgen.fromTab(function() {
            initButtons();
        });
    });
    $('#other').unbind('click touchstart').bind('click touchstart', function(ev) {
        ev.preventDefault();
        var url = $('#other_input').val();
        qrgen.fromString(url, function() {
            initButtons();
        });
    });
    $('#download_button').unbind('click touchstart').bind('click touchstart', function(ev) {
        ev.preventDefault();
        qrgen.downloadFile();
    });
});