# Pathfinding-Visualizer
Grid cell pathfinding visualization in pure html/css/js.

### Tutorial
1. The starting grid cell is colored green and the ending cell is colored red.  
2. To change the start or end location, click on the **Choose Start** or **Choose End** buttons, then click on the grid cell of your choice.
3. To draw "walls", click and drag anywhere on the grid. To erase walls, click the **Erase** button. Clicking the erase button will switch the text to **Draw**. Clicking on it again will return to draw mode.
4. Select the speed -- **Instant** will skip all animations.
5. Click **Go** to begin the visualization.Once the animation completes, the shortest path from the starting cell to the ending cell will be shown in **orange**.
6. If you change the end cell to any cell that is colored blue, the orange path will automatically update.
7. Click **Reset** to erase all "walls".
8. Click on **Go** again to restart the visualization.

### Algorithm
The algorithm is just a standard **Breadth-first Search**.  
Starting with the first cell, all neighboring cells are visited, then all cells neighboring those cells, and so on.  
The current cell is set as the parent to each of its neighboring cells.  
Once the end node is visited or there are no more unvisited neighbor cells, the process stops.  
If there is a path, we backtrack from the end cell back to the starting cell by traveling along each cell's parent cell.  
Cells that are "walls" are treated as being deleted; they are never visited.
