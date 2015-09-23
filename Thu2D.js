/**
 * Created by wwagner on 9/14/2015.
 */

var elem = document.getElementById('main');
var squares = [];
var SIDE_LENGTH = 50;

var params = { width: 800, height: 800 };
var two = new Two(params);
two.appendTo(elem);

//var square = {
//    var rect = two.makeRectangle(213, 100, 100, 100);
//    rect.fill = 'rgb(0, 200, 255)';
//    rect.opacity = .75;
//    rect.noStroke()}

function create_square(x, y, color){
    var rect = two.makeRectangle(x * SIDE_LENGTH, y * SIDE_LENGTH, SIDE_LENGTH, SIDE_LENGTH);
    if (color == "white"){
        rect.fill = '#FFFFFF';
    }
    else if (color == "black"){
        rect.fill = '#000000';
    }
    rect.opacity = 1.0;
    rect.noStroke();
    two.update();
    squares.push(rect);
}

function add_to_board(x ,y){
    if (x % 2 == 0){
        if (y % 2 == 0){
            create_square(x, y, "white");
        }
        else {
            create_square(x, y, "black");
        }
    }
    else {
        if (y % 2 == 0){
            create_square(x, y, "black");
        }
        else {
            create_square(x, y, "white");
        }
    }
}

function create_board(){
    for (var x = 0; x < 15; x++) {
        if (x < 5){
            for (var y = 5 - x; y < 10 + x; y++){
                add_to_board(x, y);
            }
        }
        else if (x < 10) {
            for (var y = 0; y < 15; y ++){
                add_to_board(x, y);
            }
        }
        else if (x < 15) {
            for (var y = x - 9; y < (24 - x); y++){
                add_to_board(x, y);
            }
        }
    }

    return two.makeGroup(squares);


}

board = create_board();
board.translation.x = 50;
board.translation.y = 50;

two.update();
