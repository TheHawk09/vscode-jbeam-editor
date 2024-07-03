let jbeamData = null
let currentPartName = null
let torbarCache // contains the high level object info
let selectedTorbarIndices = null // arry of selected torsion bar or null for no selection

// buffers for the 3d geometry
let linesObject // the scene object

function updateTorbarViz() {
  let vertexPositions = []
  torbarCache = []
  let torbarNodesCounter = 0
  for (let partName in jbeamData) {
    if(currentPartName && partName !== currentPartName) continue
    let part = jbeamData[partName]

    if(part.hasOwnProperty('torsionbars')) {
      for (let torbarId in part.torsionbars) {
        let torbar = part.torsionbars[torbarId];
        //console.log(">torbar>", torbar, part.nodes[torbar['id1:']])
        if (part.nodes) {
          let node1
          let torbarVirtual = false
          if(part.nodes && torbar['id1:'] in part.nodes) {
            node1 = part.nodes[torbar['id1:']]
          } else if(part.virtualNodes && torbar['id1:'] in part.virtualNodes) {
            node1 = part.virtualNodes[torbar['id1:']]
            torbarVirtual = true
          }
          let node2
          if(part.nodes && torbar['id2:'] in part.nodes) {
            node2 = part.nodes[torbar['id2:']]
          } else if(part.virtualNodes && torbar['id2:'] in part.virtualNodes) {
            node2 = part.virtualNodes[torbar['id2:']]
            torbarVirtual = true
          }
          let node3
          if(part.nodes && torbar['id3:'] in part.nodes) {
            node3 = part.nodes[torbar['id3:']]
          } else if(part.virtualNodes && torbar['id3:'] in part.virtualNodes) {
            node3 = part.virtualNodes[torbar['id3:']]
            torbarVirtual = true
          }
          let node4
          if(part.nodes && torbar['id4:'] in part.nodes) {
            node4 = part.nodes[torbar['id4:']]
          } else if(part.virtualNodes && torbar['id4:'] in part.virtualNodes) {
            node4 = part.virtualNodes[torbar['id4:']]
            torbarVirtual = true
          }
          if (node1 && node2 && node3 && node4) {
            torbar.node1 = node1
            torbar.node2 = node2
            torbar.node3 = node3
            torbar.node4 = node4
            torbar.virtual = torbarVirtual
            torbar.nodePos1 = new THREE.Vector3(node1.pos[0], node1.pos[1], node1.pos[2])
            torbar.nodePos2 = new THREE.Vector3(node2.pos[0], node2.pos[1], node2.pos[2])
            torbar.nodePos3 = new THREE.Vector3(node3.pos[0], node3.pos[1], node3.pos[2])
            torbar.nodePos4 = new THREE.Vector3(node4.pos[0], node4.pos[1], node4.pos[2])
            torbarCache.push(torbar)
            torbarNodesCounter+=4
            vertexPositions.push(node1.pos[0])
            vertexPositions.push(node1.pos[1])
            vertexPositions.push(node1.pos[2])
            vertexPositions.push(node2.pos[0])
            vertexPositions.push(node2.pos[1])
            vertexPositions.push(node2.pos[2])
            vertexPositions.push(node2.pos[0])
            vertexPositions.push(node2.pos[1])
            vertexPositions.push(node2.pos[2])
            vertexPositions.push(node3.pos[0])
            vertexPositions.push(node3.pos[1])
            vertexPositions.push(node3.pos[2])
            vertexPositions.push(node3.pos[0])
            vertexPositions.push(node3.pos[1])
            vertexPositions.push(node3.pos[2])
            vertexPositions.push(node4.pos[0])
            vertexPositions.push(node4.pos[1])
            vertexPositions.push(node4.pos[2])
          } else {
            console.log(`torsion bar discarded: ${torbar}`)
          }
        }
      }
    }
  }

  // Fill arrays with data for each node
  let vertexAlphas = []
  let vertexColors = []
  for (let i = 0; i < torbarCache.length; i++) {
    const torbar = torbarCache[i]
    vertexAlphas.push(0.5)
    vertexAlphas.push(0.5)
    vertexAlphas.push(0.5)
    vertexAlphas.push(0.5)
    vertexAlphas.push(0.5)
    vertexAlphas.push(0.5)
    if(torbar.virtual) {
      vertexColors.push(1, 1, 1)
      vertexColors.push(1, 1, 1)
      vertexColors.push(1, 1, 1)
      vertexColors.push(1, 1, 1)
      vertexColors.push(1, 1, 1)
      vertexColors.push(1, 1, 1)
    } else {
      vertexColors.push(1, 0, 0)
      vertexColors.push(1, 0, 0)
      vertexColors.push(1, 0, 0)
      vertexColors.push(1, 0, 0)
      vertexColors.push(1, 0, 0)
      vertexColors.push(1, 0, 0)
    }
  }

  let lineGeometry
  if(linesObject && linesObject.geometry) {
    lineGeometry = linesObject.geometry
  } else {
    lineGeometry = new THREE.BufferGeometry()
  }
  updateVertexBuffer(lineGeometry, 'position', vertexPositions, 3)
  updateVertexBuffer(lineGeometry, 'alpha', vertexAlphas, 1)
  updateVertexBuffer(lineGeometry, 'color', vertexColors, 3)
  lineGeometry.computeBoundingBox()
  lineGeometry.computeBoundingSphere()

  let lineMaterial
  if(linesObject && linesObject.material) {
    lineMaterial = linesObject.material
  } else {
    lineMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float alpha;
        attribute vec3 color;
        varying float vAlpha;
        varying vec3 vColor;

        void main() {
          vAlpha = alpha;
          vColor = color;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        varying vec3 vColor;

        void main() {
          gl_FragColor = vec4(vColor, vAlpha);
        }
      `,
      transparent: true,
      //depthTest: true,
      //side: THREE.DoubleSide
    })
  }

  if(!linesObject) {
    linesObject = new THREE.LineSegments(lineGeometry, lineMaterial);
    linesObject.name = 'linesObject'
    scene.add(linesObject)
  }
}

function onMouseMove(event) {
  if(!linesObject || !linesObject.geometry) return
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  if(!torbarCache) return

  raycaster.setFromCamera(mouse, camera)

  const alphasAttribute = linesObject.geometry.getAttribute('alpha')
  const colorsAttribute = linesObject.geometry.getAttribute('color')

  let maxDistance = 1 // Maximum distance to affect the alpha

  for (let i = 0; i < torbarCache.length; i++) {
    if(selectedTorbarIndices && selectedTorbarIndices.includes(i)) continue
    const distance = Math.min(raycaster.ray.distanceToPoint(torbarCache[i].nodePos1), raycaster.ray.distanceToPoint(torbarCache[i].nodePos2))

    // Normalize the distance based on a predefined maximum distance
    let normalizedDistance = distance / maxDistance
    normalizedDistance = THREE.MathUtils.clamp(normalizedDistance, 0, 1) // Ensure it's between 0 and 1

    // Set alpha based on distance (closer points are less transparent)
    alphasAttribute.setX(i*2  , 1.0 - (normalizedDistance * 0.6))
    alphasAttribute.setX(i*2+1, 1.0 - (normalizedDistance * 0.6))

    if(torbarCache[i].virtual) {
      let color = getColorFromDistance(distance, maxDistance, 0x88dddd, 0x00ffff)
      colorsAttribute.setXYZ(i*2  , color.r, color.g, color.b)
      colorsAttribute.setXYZ(i*2+1, color.r, color.g, color.b)
    } else {
      let color = getColorFromDistance(distance, maxDistance, 0x88dd88, 0x00ff00)
      colorsAttribute.setXYZ(i*2  , color.r, color.g, color.b)
      colorsAttribute.setXYZ(i*2+1, color.r, color.g, color.b)
    }
  }
  alphasAttribute.needsUpdate = true
  colorsAttribute.needsUpdate = true
}

function focusTorbars(torbarsArrToFocus, triggerEditor = true) {
  if (!torbarsArrToFocus || !linesObject || !linesObject.geometry) return

  let sumX = 0
  let sumY = 0
  let sumZ = 0
  let torbarCounter = 0

  //console.log('hit node:', node)
  selectedTorbarIndices = torbarsArrToFocus

  // color the node properly
  const alphasAttribute = linesObject.geometry.getAttribute('alpha');
  const colorsAttribute = linesObject.geometry.getAttribute('color');
  for (let i = 0; i < torbarCache.length; i++) {
    const torbar = torbarCache[i]
    if(selectedTorbarIndices.includes(i)) {
      alphasAttribute.setX(i*2, 1)
      alphasAttribute.setX(i*2 + 1, 1)
      alphasAttribute.setX(i*2 + 2, 1)
      alphasAttribute.setX(i*2 + 3, 1)
      colorsAttribute.setXYZ(i*2, 1, 0, 1)
      colorsAttribute.setXYZ(i*2 + 1, 1, 0, 1)
      colorsAttribute.setXYZ(i*2 + 2, 1, 0, 1)
      colorsAttribute.setXYZ(i*2 + 3, 1, 0, 1)
      sumX += torbar.node1.pos[0]
      sumY += torbar.node1.pos[1]
      sumZ += torbar.node1.pos[2]
      sumX += torbar.node2.pos[0]
      sumY += torbar.node2.pos[1]
      sumZ += torbar.node2.pos[2]
      sumX += torbar.node3.pos[0]
      sumY += torbar.node3.pos[1]
      sumZ += torbar.node3.pos[2]
      sumX += torbar.node4.pos[0]
      sumY += torbar.node4.pos[1]
      sumZ += torbar.node4.pos[2]
      torbarCounter += 4 // because of 2 nodes
      continue
    }
    alphasAttribute.setX(i*2, 0.1)
    alphasAttribute.setX(i*2 + 1, 0.1)
    alphasAttribute.setX(i*2 + 2, 0.1)
    alphasAttribute.setX(i*2 + 3, 0.1)
    if(torbar.virtual) {
      colorsAttribute.setXYZ(i*2, 0, 1, 1);
      colorsAttribute.setXYZ(i*2 + 1, 0, 1, 1);
      colorsAttribute.setXYZ(i*2 + 2, 0, 1, 1);
      colorsAttribute.setXYZ(i*2 + 3, 0, 1, 1);
    } else {
      colorsAttribute.setXYZ(i*2, 0, 1, 0);
      colorsAttribute.setXYZ(i*2 + 1, 0, 1, 0);
      colorsAttribute.setXYZ(i*2 + 2, 0, 1, 0);
      colorsAttribute.setXYZ(i*2 + 3, 0, 1, 0);
    }
  }
  alphasAttribute.needsUpdate = true;
  colorsAttribute.needsUpdate = true;

  if(selectedTorbarIndices.length === 0) selectedTorbarIndices = null
  // TODO:
  //if(triggerEditor) {
  //  highlightNodeinTextEditor()
  //}

  if(torbarCounter > 0) {
    let beamCenterPos = new THREE.Vector3(sumX / torbarCounter, sumY / torbarCounter, sumZ / torbarCounter)
    moveCameraCenter(beamCenterPos)
  }
}

function onCursorChangeEditor(message) {
  if(!torbarCache) return

  if(currentPartName !== message.currentPartName) {
    currentPartName = message.currentPartName
    updateTorbarViz()
  }

  let torbarsFound = []
  // Helper function to check if the cursor is within a given range
  const cursorInRange = (range) => {
    // only check the lines for now
    return range[0] >= message.range[0] && range[0] <= message.range[2]
  };

  for (let i = 0; i < torbarCache.length; i++) {
    if (cursorInRange(torbarCache[i].__meta.range)) {
      torbarsFound.push(i)
    }
  }

  console.log(message.range, torbarsFound, torbarCache)

  focusTorbars(torbarsFound, false)
}

function onReceiveMessage(event) {
  //console.log(">>> onReceiveMessage >>>", event)
  const message = event.data;
  switch (message.command) {
    case 'jbeamData':
      jbeamData = message.data
      selectedTorbarIndices = null
      currentPartName = null
      //console.log("GOT DATA: ", jbeamData)
      updateTorbarViz()
      break;
    case 'cursorChanged':
      onCursorChangeEditor(message)
      break
  }
}

export function init() {
  window.addEventListener('message', onReceiveMessage);
  window.addEventListener('mousemove', onMouseMove, false);
}

export function dispose() {
  window.removeEventListener('message', onReceiveMessage);
  window.removeEventListener('mousemove', onMouseMove);
  if(linesObject) {
    if (linesObject.geometry) linesObject.geometry.dispose()
    if (linesObject.geometry) linesObject.geometry.dispose()
    scene.remove(linesObject)
  }
}

export function onConfigChanged() {
  //console.log('beam.onConfigChanged', ctx.config)
}
