/**
 * Created by wwagner on 9/14/2015.
 */

//"use strict";

function game(){

    var thud = this;
    var debug_state = true;

    var elem = document.getElementById('main');
    var squares = {};
    var pieces = {};
    var SIDE_LENGTH = 50;
    var BOARD_BUFFER_X = 25;
    var BOARD_BUFFER_Y = 25;
    var current_piece = {};
    var current_player = undefined;

    var params = {width: 800, height: 800};
    var two = new Two(params);
    two.appendTo(elem);

    // var api_url = "http://willwagner.me/thud/"; // production
    var api_url = "http://10.46.211.114/thud/"; // local development

    function debug(message) {
        if (debug_state == true) {
            console.log(message);
        }
        else {
            return false;
        }
    }

    function create_square(x, y, color) {
        var rect = two.makeRectangle(x * SIDE_LENGTH, y * SIDE_LENGTH, SIDE_LENGTH, SIDE_LENGTH);
        if (color == "white") {
            rect.fill = '#FFFFFF';
        }
        else if (color == "black") {
            rect.fill = '#000000';
        }
        rect.x = x;
        rect.y = y;
        rect.opacity = 1.0;
        rect.noStroke();
        rect.type = 'square';
        two.update();
        rect.domElement = document.getElementById(rect.id);
        rect.domElement.addEventListener('click', select_square);
        squares[rect.id] = rect;
    }

    function add_square_to_board(x, y) {
        if (x % 2 == 0) {
            if (y % 2 == 0) {
                create_square(x, y, "white");
            }
            else {
                create_square(x, y, "black");
            }
        }
        else {
            if (y % 2 == 0) {
                create_square(x, y, "black");
            }
            else {
                create_square(x, y, "white");
            }
        }
    }

    function create_board() {
        for (var x = 0; x < 15; x++) {
            if (x < 5) {
                for (var y = 5 - x; y < 10 + x; y++) {
                    add_square_to_board(x, y);
                }
            }
            else if (x < 10) {
                for (var y = 0; y < 15; y++) {
                    add_square_to_board(x, y);
                }
            }
            else if (x < 15) {
                for (var y = x - 9; y < (24 - x); y++) {
                    add_square_to_board(x, y);
                }
            }
        }
        var list_of_squares = [];
        for (var i = 1; i < 166; i++) {
            list_of_squares.push(squares['two_' + i]);
        }
        board = two.makeGroup(list_of_squares);
        board.translation.x = BOARD_BUFFER_X;
        board.translation.y = BOARD_BUFFER_Y;
        return board;
    }

    function post_message(event, message) {
        // ToDo: return message sent as asynchronous request due to deprecation (even though this event is synchronous)

        // Get the CSRF token to return with the POST
        var CSRF_TOKEN = document.getElementsByName('csrfmiddlewaretoken')[0].value;

        // Setup and send POST request
        var post = new XMLHttpRequest();
        post.open('POST', api_url + event, false);
        post.setRequestHeader('X-CSRFToken', CSRF_TOKEN);
        post.setRequestHeader('Content-Type', 'application/json');
        console.log(post);
        post.withCredentials = 'true';
        post.send(JSON.stringify(message));

        return JSON.parse(post.responseText);
    }

    function start_game() {
        var message = {"game": "begin", "player_one": "Will", "player_two": "Tom"};
        var response =  post_message("start", message);
        thud.game_id = response.game;
        thud.player_one = response.player_one;
        thud.player_two = response.player_two;
        current_player = thud.player_one;
    }

    function switch_players(){
        if (current_player == thud.player_one) {
            current_player = thud.player_two;
        }
        else if (current_player == thud.player_two) {
            current_player = thud.player_one;
        }
    }

    function move_piece(destination){
        debug("Moving piece from " + current_piece.x + ', ' + current_piece.y + ' to ' +
            destination[0] + ', ' + destination[1]);

        var destination_x = destination[0] * SIDE_LENGTH + BOARD_BUFFER_X;
        var destination_y = destination[1] * SIDE_LENGTH + BOARD_BUFFER_Y;

        current_piece.translation.set(destination_x, destination_y);

        // ToDo: This probably isn't the right way to animate, maybe should be frames per second/square moved?
        //var seconds = 10;  // number of seconds to animate the moving piece across
        //var animation_wait = 10000/seconds; // number of milliseconds to wait to achieve desired frame translation rate

        // 8,8 to 9,9  = 450,450 to 500,500 = -50,-50
        // 8,8 to 7,9 = 450,450 to 400,500 = 50,-50
        // 8,8 to 9,7 = 450,450 to 500,400 = -50,50
        // 6,6 to 5,5 = 350,350 to 300,300 = 50,50
        //var delta_x = start_x - destination_x;
        //var delta_y = start_y - destination_y;
        //
        //var move_x = start_x;
        //var move_y = start_y;
        //
        //while (Math.abs(delta_x) > 0 || Math.abs(delta_y) > 0){
        //    while (current_piece.translation._x != destination_x && current_piece.translation._y != destination_y) {
        //        move_x -= SIDE_LENGTH/seconds * Math.sign(delta_x);
        //        move_y -= SIDE_LENGTH/seconds * Math.sign(delta_y);
        //        current_piece.translation.set(move_x, move_y);
        //    }
        //    if (delta_x > 0){
        //        delta_x -= SIDE_LENGTH;
        //    }
        //    else if (delta_x < 0) {
        //        delta_x += SIDE_LENGTH;
        //    }
        //    if (delta_y > 0) {
        //        delta_y -= SIDE_LENGTH;
        //    }
        //    else if (delta_y < 0) {
        //        delta_y += SIDE_LENGTH;
        //    }
        //}

        current_piece.x = (destination_x - BOARD_BUFFER_X) / SIDE_LENGTH;
        current_piece.y = (destination_y - BOARD_BUFFER_X) / SIDE_LENGTH;

        deselect_piece();
    }

    function get_piece(destination_x, destination_y){
        for (var i = 167; i < 209; i++) {
            var check_piece = pieces["two_" + i];
            if (check_piece.x == destination_x && check_piece.y == destination_y){
                return check_piece;
            }
        }
    }

    function process_attack(message, destination_x, destination_y){
        if (current_piece.race == 'troll'){
            move_piece([destination_x, destination_y]);
        }
        for (var i = 0; i < message.length; i++){
            var target = message[i];
            var target_x = target[0];
            var target_y = target[1];
            var target_piece = get_piece(target_x, target_y);
            if (target_piece != undefined){
                target_piece.remove();
            }
            else {
                debug('error: target piece not found ' + target);
            }
            two.update();
        }
        if (current_piece.race == 'dwarf'){
            move_piece([destination_x, destination_y]);
        }
    }

    function process_move(return_message, destination_x, destination_y){
        if (return_message == true) {
            // move the piece to the destination
            move_piece([destination_x, destination_y]);
            switch_players();
        }
        else if (typeof (return_message) == "object") {
            process_attack(return_message, destination_x, destination_y);
            switch_players();
        }
        else {
            deselect_piece();
            return false;
            }
        }

    function validate_move(destination) {
        var piece = current_piece;
        var start_x = piece.x;
        var start_y = piece.y;
        var destination_x = destination.x;
        var destination_y = destination.y;

        var move_message = {
            "game": thud.game_id,
            "player": current_player,
            "start": [start_x, start_y],
            "destination": [destination_x, destination_y]
        };
        var response = post_message("move", move_message);
        process_move(response, destination_x, destination_y);
    }

    function deselect_piece() {
        if (current_piece.race == 'dwarf') {
            current_piece.fill = 'red';
            two.update();
        }
        else if (current_piece.race == 'troll') {
            current_piece.fill = 'green';
            two.update();
        }
        else {
            debug('something went wrong deselecting piece with race ' + current_piece.race);
        }
        current_piece = {};
    }

    function highlight_piece(piece) {
        piece.fill = 'yellow';
        two.update();
        current_piece = piece;
    }

    function select_piece(event) {
        var selected_piece = pieces[event.srcElement.id];

        if (current_piece.type == 'piece') {
            // if a piece is already selected, attempt an attack (because this is a piece)
            validate_move(selected_piece);
        }
        else if (selected_piece.race == 'dwarf' && current_player == thud.player_one){
            highlight_piece(selected_piece);
        }
        else if (selected_piece.race == 'troll' && current_player == thud.player_two){
            highlight_piece(selected_piece);
        }
    }

    function select_square(event) {
        if (current_piece.type == 'piece') {
            // if a piece is already selected, attempt a move
            var square = squares[event.srcElement.id];
            validate_move(square);
        }
    }

    function add_piece(x, y, race) {
        if (race == 'dwarf') {
            var piece = two.makeCircle(x * SIDE_LENGTH + BOARD_BUFFER_X, y * SIDE_LENGTH + BOARD_BUFFER_Y,
                SIDE_LENGTH * 0.4);
            piece.race = 'dwarf';
            piece.fill = 'red';
        }
        else if (race == 'troll') {
            var piece = two.makeRectangle(x * SIDE_LENGTH + BOARD_BUFFER_X, y * SIDE_LENGTH + BOARD_BUFFER_Y,
                SIDE_LENGTH * 0.8, SIDE_LENGTH * 0.8);
            piece.race = 'troll';
            piece.fill = 'green';
        }
        piece.opacity = 1.0;
        piece.noStroke();
        two.update();
        piece.x = x;
        piece.y = y;
        piece.type = 'piece';
        piece.domElement = document.getElementById(piece.id);
        piece.domElement.addEventListener('click', select_piece);
        pieces[piece.id] = piece;
    }

    function add_thudstone(x, y){
        var thudstone = two.makeCircle(x * SIDE_LENGTH + BOARD_BUFFER_X, y * SIDE_LENGTH + BOARD_BUFFER_Y,
            SIDE_LENGTH * 0.4);
        thudstone.fill = 'black';
    }

    function populate_pieces() {
        for (var square_index = 1; square_index < 166; square_index++) {

            var last_square = squares['two_' + (square_index - 1)];
            var square = squares['two_' + square_index];
            var next_square = squares['two_' + (square_index + 1)];

            var row = square.translation['x'] / SIDE_LENGTH;
            var column = square.translation['y'] / SIDE_LENGTH;

            try {
                var last_row = last_square.translation['x'] / SIDE_LENGTH;
            }
            catch (error) {
                if (error instanceof TypeError){
                    // this is the first piece for the board
                }
                else
                    throw error;
            }


            try {
                var next_row = next_square.translation['x'] / SIDE_LENGTH;
            }
            catch (error) {
                if (error instanceof TypeError) {
                    add_piece(column, row, "dwarf");
                }
                else
                    throw error;
            }

            if ((row == 7 && (column == 0 || column == 14)) || (column == 7 && (row == 0 || row == 14))) {
            }
            else if (row != last_row || row != next_row) {
                // create a dwarf
                add_piece(column, row, "dwarf");
            }
            else if ((row == 6 || row == 7 || row == 8) && (column == 6 || column == 7 || column == 8) && !(row == 7 && column == 7)) {
                // create a troll
                add_piece(column, row, "troll");
            }
            else if ((row == 0 || row == 14) && (column == 6 || column == 8)) {
                add_piece(column, row, "dwarf");
            }
        }

        add_thudstone(7, 7);
    }

    start_game();

    var board = create_board();
    populate_pieces();

    add_piece(6, 6, 'troll');
    add_piece(0, 6, 'dwarf');

    two.update();
}

game();