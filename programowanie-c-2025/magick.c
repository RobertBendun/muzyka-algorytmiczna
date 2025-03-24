#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <arpa/inet.h>

/*
    ./magick input.ppm -flip output.ppm
    ./magick -generate-color [color] output.ppm
*/

void save_ppm(uint32_t *image, size_t width, size_t height, FILE *out)
{
    // RRGGBB <- uint32_t
    fprintf(out, "P6\n");
    fprintf(out, "%zu %zu\n", width, height);
    fprintf(out, "255\n");
    for (int x = 0; x < width; ++x) {
        for (int y = 0; y < height; ++y) {
            uint32_t c = image[x * width + height];
            fwrite(&c, 3, 1, out);
        }
    }
}

// argument counter
// string[] argument value
int main(int argc, char* argv[])
{
    char const *input_file_path = NULL;
    char const *flag = NULL;
    char const *output_file_path = NULL;
    char const *generate_color = NULL;

    for (int i = 1; i < argc; ++i) {
        if (strcmp("-generate-color", argv[i]) == 0) {
            if (i+1 >= argc) {
                printf("%s: error: -generate-color expects color", argv[0]);
                return 1;
            }
            generate_color = argv[i+1];
            i++;
            continue;
        } else if (argv[i][0] == '-') {
            printf("%s: error: unknown flag: %s\n", argv[0], argv[i]);
            return 1;
        } else if (input_file_path == NULL) {
            input_file_path = argv[i];
        } else if (output_file_path == NULL) {
            output_file_path = argv[i];
        } else {
            printf("%s: error: no more positionals were expected\n", argv[i]);
            return 1;
        }
    }

    if (generate_color != NULL) {
        output_file_path = input_file_path;
    }

    printf("in = %s\n", input_file_path);
    printf("out = %s\n", output_file_path);
    printf("flag = %s\n", flag);

    FILE *input = fopen(input_file_path, "r");
    if (!input) {
        printf("%s: error: %s: couldn't open file\n", argv[0], input_file_path);
        return 1;
    }

    FILE *output = fopen(output_file_path, "w");
    if (!output) {
        fclose(input);
        printf("%s: error: %s: couldn't open file\n", argv[0], output_file_path);
        return 1;
    }

    size_t width = 32;
    size_t height = 32;
    uint32_t *image = malloc(sizeof(int) * width * height);

    uint32_t color;

    // TODO: Documentation how we got to this mess will be added
    sscanf(generate_color, "%x", &color);

    for (int i = 0; i < width; ++i) {
        for (int j = 0; j < height; ++j) {
            // color must be provided in little endian
            image[i * width + j] = ntohl(color) >> 8;
        }
    }

    save_ppm(image, width, height, output);

    free(image);
    fclose(input);
    fclose(output);
    return 0;
}
