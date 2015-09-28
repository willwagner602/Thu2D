/**
 * Created by wwagner on 9/14/2015.
 */

//"use strict";

function game() {

    var thud = this;

    console.log(thud);

    var elem = document.getElementById('main');
    var squares = [];
    var pieces = {};
    var SIDE_LENGTH = 50;
    var BOARD_BUFFER_X = 25;
    var BOARD_BUFFER_Y = 25;
    var selected_piece = {};

    var params = {width: 800, height: 800};
    var two = new Two(params);
    two.appendTo(elem);

    // var api_url = "http://willwagner.me/"; // production
    var api_url = "http://127.0.0.1:12000/"; // local development

    function create_board_square(x, y, color) {
        var rect = two.makeRectangle(x * SIDE_LENGTH, y * SIDE_LENGTH, SIDE_LENGTH, SIDE_LENGTH);
        if (color == "white") {
            rect.fill = '#FFFFFF';
        }
        else if (color == "black") {
            rect.fill = '#000000';
        }
        rect.opacity = 1.0;
        rect.noStroke();
        rect.type = 'square';
        two.update();
        squares.push(rect);
    }

    function add_square_to_board(x, y) {
        if (x % 2 == 0) {
            if (y % 2 == 0) {
                create_board_square(x, y, "white");
            }
            else {
                create_board_square(x, y, "black");
            }
        }
        else {
            if (y % 2 == 0) {
                create_board_square(x, y, "black");
            }
            else {
                create_board_square(x, y, "white");
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

        board = two.makeGroup(squares);
        board.translation.x = BOARD_BUFFER_X;
        board.translation.y = BOARD_BUFFER_Y;
        return board;
    }

    function post_message(event, message) {
        // ToDo: return message sent as asynchronous request due to deprecation (even though this event is synchronous)
        var post = new XMLHttpRequest();
        post.open('POST', api_url + event, false);
        post.send(JSON.stringify(message));
        return post.responseText;
    }

    function start_game() {
        var message = {"game": "begin", "player_one": "Will", "player_two": "Tom"};
        var response =  JSON.parse(post_message("start", message));
        thud.game_id = response.game;
        thud.player_one = response.player_one;
        thud.player_two = response.player_two;
    }

    function validate_move(destination) {
        var piece = selected_piece;
        var start_x = piece.x;
        var start_y = piece.y;
        var destination_x = destination.x;
        var destination_y = destination.y;

        console.log(thud.player_one, thud.player_two, thud.game_id);
        // ToDo: send formed message here, and pass to a resolve move function if true

    }

    function validate_attack(target) {
        var start_x = selected_piece.x;
        var start_y = selected_piece.y;
        var destination_x = target.x;
        var destination_y = target.y;

        console.log('validate attack');
        deselect_piece();
        // ToDo: send formed message here, and pass to a resolve attack function if true
    }

    function deselect_piece() {
        if (selected_piece.race == 'dwarf') {
            selected_piece.fill = 'red';
            two.update();
        }
        else if (selected_piece.race == 'troll') {
            selected_piece.fill = 'green';
            two.update();
        }
        selected_piece = undefined;
    }

    function select_piece(event) {
        var square = pieces[event.srcElement.id];

        if (selected_piece.type == 'piece') {
            // if a piece is already selected, attempt an attack (because this is a piece)
            validate_attack(square)
        }
        else {
            square.fill = 'yellow';
            two.update();
            selected_piece = square;
        }
    }

    function select_square(event) {
        if (selected_piece.type == 'piece') {
            // if a piece is already selected, attempt a move
            var square = board[event.srcElement.id];
            validate_move(square);
        }
    }

    function add_piece(x, y, race) {
        var rect = two.makeRectangle(x * SIDE_LENGTH + BOARD_BUFFER_X, y * SIDE_LENGTH + BOARD_BUFFER_Y,
            SIDE_LENGTH * 0.8, SIDE_LENGTH * 0.8);
        if (race == 'dwarf') {
            rect.fill = 'red';
        }
        else if (race == 'troll') {
            rect.fill = 'green';
        }
        rect.opacity = 1.0;
        rect.noStroke();
        two.update();
        rect.x = x;
        rect.y = y;
        rect.type = 'piece';
        rect.domElement = document.getElementById(rect.id);
        rect.domElement.addEventListener('click', select_piece);
        pieces[rect.id] = rect;
    }

    function populate_pieces(board) {
        for (var square_index = 1; square_index < 166; square_index++) {

            var last_square = board.children['two_' + (square_index - 1)];
            var square = board.children['two_' + square_index];
            var next_square = board.children['two_' + (square_index + 1)];

            var row = square.translation['x'] / SIDE_LENGTH;
            var column = square.translation['y'] / SIDE_LENGTH;

            // ToDo: This should probably be a try, where failure logs the current square for debugging
            try {
                var last_row = last_square.translation['x'] / SIDE_LENGTH;
                var last_column = last_square.translation['y'] / SIDE_LENGTH;
            }
            catch (error) {
                if (error instanceof TypeError)
                    console.log("Failed to find previous square from ", row, column);
                else
                    throw error;
            }


            try {
                var next_row = next_square.translation['x'] / SIDE_LENGTH;
                var next_column = next_square.translation['y'] / SIDE_LENGTH;
            }
            catch (error) {
                if (error instanceof TypeError) {
                    console.log("Failed to find next square from ", row, column, ", adding last dwarf.");
                    add_piece(column, row, "dwarf");
                }
                else
                    throw error;
            }

            if ((row == 7 && (column == 0 || column == 14)) || (column == 7 && (row == 0 || row == 14))) {
                //do nothing - center of each side is empty, and direct center is empty
                var nothing = undefined;
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
    }

    var board = create_board();
    populate_pieces(board);

    add_piece(6, 6, 'troll');
    add_piece(0, 6, 'dwarf');

    two.update();

    start_game();
}

game();