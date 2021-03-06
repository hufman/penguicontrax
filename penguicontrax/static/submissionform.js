$(document).ready(function () {

    var titleanddescriptionadvice = "<p>The title and description will appear to attendees on the website and in the schedule book.<br/>Please do not leave comments here for the convention committee.</p>";
    var titleadvice = "<p>The title will sometimes be used without the description, so please be informative. Only be cute if it's still easy to understand what to expect.</p>";
    var descriptionadvice = '<p><em>Tips</em><ul><li class="small">Don\'t say "I".</li><li class="small">Instead of parentheses, try making a new sentence or re-arranging phrases in the sentence.</li><li class="small">Many people have never heard of your topic. Help them figure out whether to attend.</li><li class="small">Will it be introductory or advanced?</li><li class="small">Do the participants need to bring something?</li><li class="small">Will they need to sign up in advance at Ops?</li></ul></p>';

    //style checkboxes
    //$(':checkbox[class!="button-checkbox"]').checkbox();

    //display a message as people type into fields with max length set on them
    var characterCounter = function () {
        var el, len, grp, limit, remaining, charnum, title;

        len = this.value.length;
        el = $(this);
        grp = el.parents('.form-group');

        limit = el.attr('maxlength');
        title = el.attr('data-display-title') ? el.attr('data-display-title') : this.name;

        charnum = grp.find('.charnum');
        remaining = limit - len;

        if (!charnum.length) {
            grp.append('<small class="charnum" style="display:none"></small>');
            //rerun to get the pointer
            charnum = grp.find('.charnum');
        }

        if (len > 0) {
            charnum.css('display', 'block');
        } else {
            charnum.css('display', 'none');
        }

        charnum.text(remaining + " more characters can fit in the " + title + ".");

        grp.removeClass('has-warning');

        if (limit == len) {
            charnum.text("Maximum length of " + limit + " reached for " + title);
        } else if ((limit - len) < 5) {
            grp.addClass('has-warning');
        }
    };
    var blurRemoveWarning = function () {
        $(this).parents('.form-group').removeClass('has-warning').find('.charnum').remove();
    };
    $('form textarea[maxlength],form input[maxlength]').on("input", characterCounter).on('blur', blurRemoveWarning);


    function updateTypeOptions() {
        //
        // To ensure that the elements hidden or shown in each state,
        // we use flags mark them all hidden, then set those which are
        // not hidden, and then use the flags at the end of the function
        // to set every element.

        var $pptype = $('#pptype');
        var $formGroup = $('.presenters-input');
        var furniture = "";
        var pluralized = $('form').data('pluralPresenter');

        var otherfacilityshow = false;
        var playersshow = false;
        var ppshow = false;
        var pptypeshow = false;
        var resourcesshow = false;

        var pluralpptypetext = '';
        var pptypetext = '';

        // overwrite only
        if (!pluralized) {
            pptypeshow = true;
        }

        //show the form group
        $formGroup.removeClass('hidden');


        switch ($(this).val()) {

            case 'noroomtype':
                break;
            case 'talk':
                pptypetext = "Speaker:";
                pluralpptypetext = "Panelists:";
                furniture = "Four chairs behind a table. It is faced by rows of chairs.";
                resourcesshow = true;
                otherfacilityshow = true;
                ppshow = true;
                break;
            case 'workshop':
                pptypetext = 'Activity leader:';
                pluralpptypetext = 'Activity leaders:';
                furniture = "A table surrounded by several chairs.";
                resourcesshow = true;
                otherfacilityshow = true;
                ppshow = true;
                break;
            case 'bof':
                otherfacilityshow = true;
                furniture = "Several chairs.";
                //hide the presenters form group
                $formGroup.addClass('hidden');
                break;
            case 'demo':
                pptypetext = 'Teacher:';
                pluralpptypetext = 'Teachers:';
                furniture = "Rectangular tables with chairs facing the front.";
                otherfacilityshow = true;
                break;
            case 'game':
                pptypetext = 'Game master:';
                pluralpptypetext = 'Game masters:';
                playersshow = true;
                furniture = "A table and five chairs.";
                otherfacilityshow = true;
                break;
            case 'onstage':
                $pptype.text('Performer:');
                pptypetext = 'Performer:';
                pluralpptypetext = 'Performers:';
                resourcesshow = true;
                furniture = "A stage at the front of the room, faced by rows of chairs.";
                otherfacilityshow = true;
                break;
            case 'roving':
                pptypetext = 'Activity leader:';
                pluralpptypetext = 'Activity leaders:';
                furniture = "No furniture needed.";
                otherfacilityshow = true;
                break;
        }

        // now we have all of the values. set everything.
        if (otherfacilityshow) {
            $('#otherfacility').removeClass('hidden');
            var updatedplaceholder = furniture + " Other room and furniture setup requests go here (not guaranteed). If you selected \'More\', we\'ll work out the specifics with you later.";
            $('#facilityrequest').attr('placeholder', updatedplaceholder);
        }
        else
            $('#otherfacility').addClass('hidden');
        if (playersshow)
            $('#players').removeClass('hidden');
        else
            $('#players').addClass('hidden');
        if (ppshow)
            $('#pp').removeClass('hidden');
        else
            $('#pp').addClass('hidden');
        if (pptypeshow)
            $pptype.removeClass('hidden');
        else
            $pptype.addClass('hidden');
        if (resourcesshow)
            $('#resources').removeClass('hidden');
        else
            $('#resources').addClass('hidden');

        $pptype.text(pptypetext);
        $('#pluralpptype').text(pluralpptypetext);
    }


    function update_time_options() {
        var timeval = $(this).val();
        if (timeval == 0) {
            $("#setupandrepeat, #othertime").addClass('hidden');
        } else if (timeval == 5) {
            $("#setupandrepeat").addClass('hidden');
            $("#othertime").removeClass('hidden');
        } else {
            $("#setupandrepeat, #othertime").removeClass('hidden');
        }
    }

    function attachTypeahead() {

        $('.presenter-typeahead').typeahead(
            {
                hint: true,
                highlight: true,
                minLength: 2
            },
            {
                name: 'persons',
                displayKey: 'name',
                source: function (query, process) {
                    $.ajax({
                        url: '/api/persons',
                        data: {
                            q: query
                        }
                    }).done(function (data) {
                        process(data)
                    })
                }
            }).on('typeahead:selected', function (ev, selection) {
                //add id, and email /phone if present
                var $parent = $(this).parents('.form-group');
                $parent.find('[name="presenter_id"]').val(selection.id);
                $parent.find('[name="presenter_idtype"]').val('person');
                $parent.find('[name="email"]').val(selection.email ? selection.email : "");
                $parent.find('[name="phone"]').val(selection.phone ? selection.phone : "");
            });
    }

    // When a track is selected, auto-check a topic checkbox of the same name (if any)
    function add_topic() {
        var trackval = $(this).val();
        if ( $('#taglabel_' + trackval).find(':checkbox').prop('checked') === false) {
            $('#taglabel_' + trackval).button('toggle').find(':checkbox').prop('checked');
        }
    } 

    //set up delegated handler for event type and timechange
    $('form')
        .delegate('input[name=eventtype]', 'change',function handleTypeChange() {
            if (this.checked) {
                updateTypeOptions.call(this);
            }
        }).delegate('input[name=duration]', 'change',function handleTimeChange() {
            if (this.checked) {
                update_time_options.call(this);
            }
        }).delegate('button#newperson', 'click',function (ev) {
            ev.preventDefault();
            var $formGroup = $('.form-group.presenters').last();
            var people = $('[name="presenter"]').length;

            $('form').data('pluralPresenter', true);

            $('#pptype').addClass('hidden');
            $('#pluralpptype').removeClass('hidden');

            $('.presenter-typeahead').typeahead('destroy')

            var clone = $formGroup.clone();

            clone.find('input').val('');

            $formGroup.after(clone);

            attachTypeahead();

            if (people == 6) {
                $(this).hide();
            }
            return false;
        }).delegate('#suggesterPresents', 'click', function () {
            var checked = $(this).is(":checked");
            var $field = $('[name=submitter_id]');
            var submitter_id = $field.data('id');
            var submitter_name = $field.data('name');
            var submitter_email = $field.data('email');
            var submitter_phone = $field.data('phone');

            if (checked) {
                $('[name="presenter_id"]').first().val(submitter_id)
                $('[name="presenter_idtype"]').first().val('user')
                $('[name="presenter"]').first().val(submitter_name)
                $('[name="email"]').first().val(submitter_email)
                $('[name="phone"]').first().val(submitter_phone)
            } else {
                $('[name="presenter_id"]').first().val('')
                $('[name="presenter_idtype"]').first().val('')
                $('[name="presenter"]').first().val('')
                $('[name="email"]').first().val('')
                $('[name="phone"]').first().val('')
            }
        }).delegate('input[name=track]', 'change',function handleTrackChange() {
            if (this.checked) {
                add_topic.call(this);
            };
        })

    //run once to catch initial page state
    $("[name=eventtype]:checked").each(function () {
        updateTypeOptions.call(this);
    });


    $("[name=timechange]:checked").each(function () {
        update_time_options.call(this);
    });

    //attach first typeahead
    //subsequent typeahead is decorated when new presenter fields are added
    attachTypeahead();

    $('#moresetuplink').click(function () {
        if ($('#setupandrepeat:visible').length == 0) {
            $('#setupandrepeat').show();
            $('#othertime').show();
        } else {
            $('#setupandrepeat').hide();
            $('#othertime').hide();
        }
        return false;
    });

    $('#title').on({
        focusin: function () {
            console.log('in title');
            $('#advice').html(titleadvice);
        }, focusout: function () {
            console.log('left title');
            $('#advice').html(titleanddescriptionadvice);
        } 
    });
    $('#description').on({
        focusin: function () {
            console.log('in description');
            $('#advice').html(descriptionadvice);
        }, focusout: function () {
            console.log('left description');
            $('#advice').html(titleanddescriptionadvice);
        } 
    });       

    $('#submitevent').click(function (ev) {

        $(".alert").css('display', 'none');

        var validated = true;

        if ($("[name='eventtype']:radio:checked").length == 0) {
            validated = false;
            console.log(validated);
            $("#eventtyperequired").css('display', 'block');
        }
        if ($("[name='duration']:radio:checked").length == 0) {
            validated = false;
            $("#durationrequired").css('display', 'block');
        }
        if ($.trim($("#title").val()) == '') {
            validated = false;
            $("#titlerequired").css('display', 'block');
        }
        if ($("#description").val() != '') {
        } else {
            validated = false;
            $("#descriptionrequired").css('display', 'block');
        }
        if ($("[name='tag']:checkbox:checked").length == 0) {
            validated = false;
            $("#topicrequired").css('display', 'block');
        }
        if ($("[name='track']:radio:checked").length == 0) {
            validated = false;
            $("#trackrequired").css('display', 'block');
        }

        if (validated == false) {
            ev.preventDefault();
        } else {
            // Clear all hidden inputs.
            $("[:input:hidden]").val('');

            // Combine all the comment fields into one comment.
            var facilitycomment, timecomment;
            facilitycomment = $("facilityrequest").val();
            timecomment = $("timerequest").val();
            $("#comments").val(facilitycomment + " | " + timecomment);

            $('form').submit();
            
        }
    });
});
