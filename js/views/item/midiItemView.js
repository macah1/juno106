define([
    'backbone',
    'hbs!tmpl/item/midiItemView-tmpl'
    ],
    
    function(Backbone, Template) {
        return Marionette.ItemView.extend({
            
            className: 'midi',
            
            template: Template,
            
            ui: {
                select: '.js-active-midi',
                midiButton: '.button--midi',
                midiLabel: '.js-midi-label',
                midiSpinner: '.js-midi-spinner',
                check: '.js-midi-check',
                error: '.js-midi-error'
            },
            
            events: {
                'change @ui.select': 'selectMidi',
                'click @ui.midiButton': 'requestMidi'
            },
            
            initialize: function(options) {
                this.midiListener = options.midiListener;
                this.midi = false;
                this.inputs = [];
                this.activeDevice = null;
            },
            
            onRender: function() {
                this.ui.midiSpinner.hide();
            },
            
            onShow: function() {
                this.requestMidi();
            },
            
            requestMidi: function() {
                var that = this;
                var inputs; 
                this.inputs = [];
                
                this.ui.midiLabel.hide();
                this.ui.midiSpinner.show();
                
                try {
                        navigator.requestMIDIAccess().then(function(access) {
                        if(access.inputs && access.inputs.size > 0) {
                            that.midi = true;
                            inputs = access.inputs.values();
                            for (input = inputs.next(); input && !input.done; input = inputs.next()) {
                                that.inputs.push(input.value);
                            }
                            that.render();
                            that.selectMidi();
                        } else {
                            that.render();
                        }
                    });
                } catch (e) {
                    console.log('No MIDI access');
                    this.render();
                }
            },
            
            selectMidi: function() {
                this.activeDevice = _.findWhere(this.inputs, {name: this.ui.select.val() });
                this.activeDevice.onmidimessage = this.handleMidi.bind(this);
            },
            
            handleMidi: function(e) {
                this.midiListener.trigger('midiMessage', e.data);
            },
            
            serializeData: function() {
                return {
                    midi: this.midi,
                    inputs: this.inputs
                };
            }
            
        });
    });