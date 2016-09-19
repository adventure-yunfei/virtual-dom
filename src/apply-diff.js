export default function applyDiff(diffTypes) {
    diffTypes.forEach(diffType => {
        diffType.apply();
    });
}
