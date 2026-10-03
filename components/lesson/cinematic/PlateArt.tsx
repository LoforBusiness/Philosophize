// A set plate (plates.ts) on the stage: its baked PNG where one exists, and the live
// layers otherwise. `PlateLive` is also what `make:plates` photographs, so the picture
// and the layers cannot be two different drawings.
import { Image, View } from 'react-native';
import SetArt from './SetArt';
import ObjectArt from './ObjectArt';
import { PLATES, type Plate } from './plates';
import { PLATE_ART } from './platesArt';

/** The plate's layers, drawn live in world units. */
export function PlateLive({ plate }: { plate: Plate }) {
  return (
    <>
      {plate.layers.map((l, i) =>
        l.set ? <SetArt key={i} parts={l.set} tone={plate.tone} line={l.line} />
          : l.obj ? <ObjectArt key={i} parts={l.obj} tone={plate.tone} line={l.line} />
            : null,
      )}
    </>
  );
}

/** A plate in world units: one picture, or the live layers if it has not been baked. */
export default function PlateArt({ id }: { id: string }) {
  const plate = PLATES[id];
  const art = PLATE_ART[id];
  if (!art) {
    return (
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
        <PlateLive plate={plate} />
      </View>
    );
  }
  const b = plate.box;
  return (
    <Image
      source={art}
      // no cross-fade on arrival, and never decoded smaller than the file: the camera
      // zooms the picture past its laid-out size
      fadeDuration={0}
      resizeMethod="scale"
      style={{ position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h }}
    />
  );
}
